const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_FILE = path.join(__dirname, "bioskop.db");
const db = new sqlite3.Database(DB_FILE);

db.serialize(() => {
  console.log("{Proses mengisi data dummy...");

  // Bersihkan data lama DAN reset auto-increment counter
  db.run("DELETE FROM Tickets");
  db.run("DELETE FROM sqlite_sequence WHERE name='Tickets'");

  db.run("DELETE FROM Customers");
  db.run("DELETE FROM sqlite_sequence WHERE name='Customers'");

  db.run("DELETE FROM Movies");
  db.run("DELETE FROM sqlite_sequence WHERE name='Movies'");

  db.run("DELETE FROM Showtimes");
  db.run("DELETE FROM sqlite_sequence WHERE name='Showtimes'");

  console.log("🧹 Data lama & counter berhasil direset.");

  // Data Costumers
  db.run(`INSERT INTO Customers (name, email, phone) VALUES
    ('Andi', 'andi@mail.com', '0812345671'),
    ('Budi', 'budi@mail.com', '0812345672'),
    ('Citra', 'citra@mail.com', '0812345673'),
    ('Dewi', 'dewi@mail.com', '0812345674'),
    ('Eko', 'eko@mail.com', '0812345675')
  `);

  // Data Movies
  db.run(`INSERT INTO Movies (title, genre, duration) VALUES
    ('The Silent Sea', 'Sci-Fi', 120),
    ('Love in Jogja', 'Romance', 95),
    ('The Lost City', 'Action', 110),
    ('Laugh Out Loud', 'Comedy', 100)
  `);

  // Data Showtimes
  db.run(`INSERT INTO Showtimes (movie_id, show_date, show_time) VALUES
    (1, '2025-10-01', '18:00'),
    (2, '2025-10-01', '20:00'),
    (3, '2025-10-02', '19:00'),
    (4, '2025-10-03', '21:00')
  `);

  // Data Tickets (Transaksi)
  db.run(`INSERT INTO Tickets (customer_id, showtime_id, seat_number, price, discount, total, payment_method, purchase_date) VALUES
    (1, 1, 'A1', 50000, 5000, 45000, 'E-Wallet', '2025-10-01'),
    (1, 2, 'A2', 50000, 0, 50000, 'Cash', '2025-10-01'),
    (2, 1, 'B1', 50000, 0, 50000, 'Card', '2025-10-01'),
    (2, 3, 'B2', 55000, 5000, 50000, 'E-Wallet', '2025-10-02'),
    (3, 4, 'C1', 60000, 10000, 50000, 'E-Wallet', '2025-10-03'),
    (3, 2, 'C2', 50000, 0, 50000, 'Cash', '2025-10-01'),
    (4, 3, 'D1', 55000, 0, 55000, 'Card', '2025-10-02'),
    (5, 4, 'E1', 60000, 5000, 55000, 'E-Wallet', '2025-10-03'),
    (5, 1, 'E2', 50000, 5000, 45000, 'Cash', '2025-10-01'),
    (2, 2, 'B3', 50000, 0, 50000, 'Card', '2025-10-01')
  `);

  console.log("Data dummy OLTP berhasil dimasukkan.");
});

db.close();
