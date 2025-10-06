// dw/dw_schema.js
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("bioskop_dw.db");

db.serialize(() => {
  console.log("Membuat ulang schema Data Warehouse...");

  // Hapus tabel lama jika ada
  db.run(`DROP TABLE IF EXISTS dim_customer`);
  db.run(`DROP TABLE IF EXISTS dim_movie`);
  db.run(`DROP TABLE IF EXISTS dim_studio`);
  db.run(`DROP TABLE IF EXISTS dim_date`);
  db.run(`DROP TABLE IF EXISTS fact_sales`);

  // Tabel Dimensi
  db.run(`
    CREATE TABLE dim_customer (
      customer_key INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      name TEXT,
      gender TEXT,
      email TEXT,
      phone TEXT
    )
  `);

  db.run(`
    CREATE TABLE dim_movie (
      movie_key INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER,
      title TEXT,
      genre TEXT,
      duration INTEGER,
      rating REAL
    )
  `);

  db.run(`
    CREATE TABLE dim_studio (
      studio_key INTEGER PRIMARY KEY AUTOINCREMENT,
      studio_id INTEGER,
      name TEXT,
      capacity INTEGER
    )
  `);

  db.run(`
    CREATE TABLE dim_date (
      date_key INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      day INTEGER,
      month INTEGER,
      year INTEGER
    )
  `);

  // Tabel Fakta Penjualan
  db.run(`
    CREATE TABLE fact_sales (
      sales_key INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_key INTEGER,
      movie_key INTEGER,
      studio_key INTEGER,
      date_key INTEGER,
      total REAL,
      payment_method TEXT,
      FOREIGN KEY(customer_key) REFERENCES dim_customer(customer_key),
      FOREIGN KEY(movie_key) REFERENCES dim_movie(movie_key),
      FOREIGN KEY(studio_key) REFERENCES dim_studio(studio_key),
      FOREIGN KEY(date_key) REFERENCES dim_date(date_key)
    )
  `);

  console.log("Schema Data Warehouse berhasil");
});

db.close();
