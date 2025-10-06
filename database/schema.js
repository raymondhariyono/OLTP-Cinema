// schema.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Nama file database
const DB_FILE = path.join(__dirname, "bioskop.db");
const db = new sqlite3.Database(DB_FILE);

db.serialize(() => {
  console.log("Proses embuat tabel OLTP");

  // Tabel Customers
  db.run(`CREATE TABLE IF NOT EXISTS Customers (
        customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT
    )`);

  // Tabel Movies
  db.run(`CREATE TABLE IF NOT EXISTS Movies (
        movie_id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        genre TEXT,
        duration INTEGER
    )`);

  // Tabel Showtimes
  db.run(`CREATE TABLE IF NOT EXISTS Showtimes (
        showtime_id INTEGER PRIMARY KEY AUTOINCREMENT,
        movie_id INTEGER,
        show_date TEXT,
        show_time TEXT,
        FOREIGN KEY(movie_id) REFERENCES Movies(movie_id)
    )`);

  // Tabel Tickets (Transaksi)
  db.run(`CREATE TABLE IF NOT EXISTS Tickets (
        ticket_id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        showtime_id INTEGER,
        seat_number TEXT,
        price REAL,
        discount REAL,
        total REAL,
        payment_method TEXT,
        purchase_date TEXT,
        FOREIGN KEY(customer_id) REFERENCES Customers(customer_id),
        FOREIGN KEY(showtime_id) REFERENCES Showtimes(showtime_id)
    )`);

  console.log("Schema OLTP selesai dibuat");
});

db.close();
