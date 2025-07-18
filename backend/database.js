
const sqlite3 = require('sqlite3').verbose();

// connect to a database
const db = new sqlite3.Database('./restaurant.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the restaurant database.');
});

// create tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer'
  )`, (err) => {
    if (err) {
      console.error('Error creating Users table:', err.message);
    } else {
      console.log('Users table created or already exists.');
    }
  });

  // Reservations table
  db.run(`CREATE TABLE IF NOT EXISTS Reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    party_size INTEGER NOT NULL,
    reservation_time DATETIME NOT NULL,
    special_occasion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users (id)
  )`, (err) => {
    if (err) {
      console.error('Error creating Reservations table:', err.message);
    } else {
      console.log('Reservations table created or already exists.');
    }
  });

  // EmailTemplates table
  db.run(`CREATE TABLE IF NOT EXISTS EmailTemplates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    body TEXT NOT NULL
  )`, (err) => {
    if (err) {
      console.error('Error creating EmailTemplates table:', err.message);
    } else {
      console.log('EmailTemplates table created or already exists.');
      // Insert a default email template
      const templateSql = `INSERT OR IGNORE INTO EmailTemplates (name, subject, body) VALUES (?, ?, ?)`;
      const defaultTemplate = {
        name: 'reservation_confirmation',
        subject: 'Your Reservation is Confirmed!',
        body: 'Dear {name},\n\nThank you for your reservation at our restaurant. We are pleased to confirm your booking for {party_size} people on {date} at {time}.\n\nWe look forward to seeing you!\n\nSincerely,\nThe Restaurant Team'
      };
      db.run(templateSql, [defaultTemplate.name, defaultTemplate.subject, defaultTemplate.body], (err) => {
        if (err) {
          return console.error('Error inserting default email template:', err.message);
        }
        console.log('Default email template inserted or already exists.');
      });
    }
  });

  // RestaurantSettings table
  db.run(`CREATE TABLE IF NOT EXISTS RestaurantSettings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL
  )`, (err) => {
    if (err) {
      console.error('Error creating RestaurantSettings table:', err.message);
    } else {
      console.log('RestaurantSettings table created or already exists.');
      // Populate with default settings if empty
      db.get('SELECT COUNT(*) as count FROM RestaurantSettings', (err, row) => {
        if (row.count === 0) {
          db.run("INSERT INTO RestaurantSettings (setting, value) VALUES ('max_tables', '15')");
          db.run("INSERT INTO RestaurantSettings (setting, value) VALUES ('max_reservations', '10')");
          console.log('Default restaurant settings inserted.');
        }
      });
    }
  });
});

module.exports = db;
