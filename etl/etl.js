const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

async function runETL() {
  console.log("Memulai proses ETL");

  const dbOLTP = await open({
    filename: path.join(__dirname, "../database/bioskop.db"),
    driver: sqlite3.Database,
  });

  const dbDW = await open({
    filename: path.join(__dirname, "../dw/bioskop_dw.db"),
    driver: sqlite3.Database,
  });

  console.log("Koneksi database berhasil");

  const transactions = await dbOLTP.all(`
    SELECT
      t.ticket_id,
      t.total,
      t.payment_method,
      t.purchase_date,
      c.customer_id,
      c.name AS customer_name,
      c.email AS customer_email,
      c.phone AS customer_phone,
      m.movie_id,
      m.title AS movie_title,
      m.genre AS movie_genre,
      m.duration AS movie_duration
    FROM Tickets t
    JOIN Customers c ON t.customer_id = c.customer_id
    JOIN Showtimes s ON t.showtime_id = s.showtime_id
    JOIN Movies m ON s.movie_id = m.movie_id
  `);

  console.log(
    `Data berhasil diekstrak dari OLTP ${transactions.length} transaksi ditemukan.`
  );

  const customers = new Map();
  const movies = new Map();
  const dates = new Map();

  transactions.forEach((t) => {
    if (!customers.has(t.customer_id)) {
      customers.set(t.customer_id, {
        customer_id: t.customer_id,
        name: t.customer_name,
        email: t.customer_email,
        phone: t.customer_phone,
      });
    }

    if (!movies.has(t.movie_id)) {
      movies.set(t.movie_id, {
        movie_id: t.movie_id,
        title: t.movie_title,
        genre: t.movie_genre,
        duration: t.movie_duration,
      });
    }

    if (!dates.has(t.purchase_date)) {
      const date = new Date(t.purchase_date);
      dates.set(t.purchase_date, {
        date_key: parseInt(
          date.getFullYear().toString() +
            (date.getMonth() + 1).toString().padStart(2, "0") +
            date.getDate().toString().padStart(2, "0")
        ),
        date: t.purchase_date,
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      });
    }
  });

  console.log("Data berhasil ditransformasi.");

  console.log("Memuat data ke Data Warehouse...");

  await dbDW.exec(`
    DELETE FROM dim_customer;
    DELETE FROM dim_movie;
    DELETE FROM dim_date;
    DELETE FROM fact_sales;
  `);
  console.log("Tabel DW lama berhasil dibersihkan.");

  for (const c of customers.values()) {
    await dbDW.run(
      `INSERT INTO dim_customer (customer_id, name, email, phone) VALUES (?, ?, ?, ?)`,
      [c.customer_id, c.name, c.email, c.phone]
    );
  }
  console.log(`-> ${customers.size} data dim_customer dimuat.`);

  for (const m of movies.values()) {
    await dbDW.run(
      `INSERT INTO dim_movie (movie_id, title, genre, duration) VALUES (?, ?, ?, ?)`,
      [m.movie_id, m.title, m.genre, m.duration]
    );
  }
  console.log(`-> ${movies.size} data dim_movie dimuat.`);

  for (const d of dates.values()) {
    await dbDW.run(
      `INSERT INTO dim_date (date_key, date, day, month, year) VALUES (?, ?, ?, ?, ?)`,
      [d.date_key, d.date, d.day, d.month, d.year]
    );
  }
  console.log(`-> ${dates.size} data dim_date dimuat.`);

  for (const t of transactions) {
    const customerKey = (
      await dbDW.get(
        "SELECT customer_key FROM dim_customer WHERE customer_id = ?",
        t.customer_id
      )
    ).customer_key;
    const movieKey = (
      await dbDW.get(
        "SELECT movie_key FROM dim_movie WHERE movie_id = ?",
        t.movie_id
      )
    ).movie_key;
    const dateKeyObj = await dbDW.get(
      "SELECT date_key FROM dim_date WHERE date = ?",
      t.purchase_date
    );
    if (!dateKeyObj) continue;
    const dateKey = dateKeyObj.date_key;

    await dbDW.run(
      `INSERT INTO fact_sales (customer_key, movie_key, date_key, total, payment_method) VALUES (?, ?, ?, ?, ?)`,
      [customerKey, movieKey, dateKey, t.total, t.payment_method]
    );
  }
  console.log(`-> ${transactions.length} data fact_sales dimuat.`);

  console.log("Data berhasil dimuat ke Data Warehouse");

  await dbOLTP.close();
  await dbDW.close();
  console.log("Proses ETL selesai");
}

runETL().catch((err) => console.error("ETL gagal ", err));
