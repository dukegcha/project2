
const express = require('express');
const db = require('./database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middleware/auth');
const { setupEmail, sendConfirmationEmail } = require('./config/email');
const authorizeStaff = require('./middleware/authorize');

const JWT_SECRET = 'your_jwt_secret_key'; // Replace with a strong, secret key in a real app
const app = express();
const port = 3000;

app.use(express.json());

// User registration
app.post('/register', async (req, res) => {
  const { name, email, password, phone, role, adminCode } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ error: 'Please provide name, email, password, and phone number.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let userRole = 'customer';
    if (role === 'staff' && adminCode === 'SECRET_ADMIN_CODE') {
      userRole = 'staff';
    }

    const sql = 'INSERT INTO Users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)';
    db.run(sql, [name, email, hashedPassword, phone, userRole], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Email already in use.' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// User login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.' });
  }

  const sql = 'SELECT * FROM Users WHERE email = ?';
  db.get(sql, [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
});

// Get available reservation slots
app.get('/availability', (req, res) => {
  const { date } = req.query; // Expecting date in 'YYYY-MM-DD' format

  if (!date) {
    return res.status(400).json({ error: 'Date query parameter is required.' });
  }

  const sqlSettings = 'SELECT value FROM RestaurantSettings WHERE setting = ?';
  db.get(sqlSettings, ['max_reservations'], (err, setting) => {
    if (err || !setting) {
      return res.status(500).json({ error: 'Could not retrieve restaurant settings.' });
    }

    const maxReservations = parseInt(setting.value, 10);
    const sqlReservations = 'SELECT reservation_time FROM Reservations WHERE date(reservation_time) = ?';

    db.all(sqlReservations, [date], (err, reservations) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const availableSlots = [];
      for (let hour = 17; hour < 22; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slot = new Date(`${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`);
          const conflictingReservations = reservations.filter(r => {
            const reservationTime = new Date(r.reservation_time);
            const diffMinutes = (slot - reservationTime) / (1000 * 60);
            return diffMinutes >= -89 && diffMinutes <= 89;
          }).length;

          if (conflictingReservations < maxReservations) {
            availableSlots.push(slot.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
          }
        }
      }
      res.json(availableSlots);
    });
  });
});

// Create a new reservation (protected)
app.post('/reservations', authenticateToken, (req, res) => {
  const { party_size, reservation_time, special_occasion } = req.body;
  const userId = req.user.id;

  if (!party_size || !reservation_time) {
    return res.status(400).json({ error: 'Party size and reservation time are required.' });
  }

  const sqlUser = 'SELECT name, email, phone FROM Users WHERE id = ?';
  db.get(sqlUser, [userId], (err, user) => {
    if (err || !user) {
      return res.status(500).json({ error: 'Could not retrieve user details.' });
    }

    const { name, email, phone } = user;

    if (!phone) {
        return res.status(400).json({ error: 'User profile is missing a phone number.' });
    }

    const sqlInsert = `INSERT INTO Reservations (user_id, name, phone, email, party_size, reservation_time, special_occasion)
                       VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.run(sqlInsert, [userId, name, phone, email, party_size, reservation_time, special_occasion], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, message: 'Reservation created successfully.' });

      // Send confirmation email using the template from the database
      const reservationDetails = { name, email, party_size, reservation_time };
      sendConfirmationEmail(reservationDetails);
    });
  });
});

// Staff Dashboard: Get all reservations for a specific day
app.get('/dashboard/reservations', [authenticateToken, authorizeStaff], (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Date query parameter is required.' });
  }
  const sql = 'SELECT * FROM Reservations WHERE date(reservation_time) = ? ORDER BY reservation_time';
  db.all(sql, [date], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Customer: Get their own reservation history
app.get('/my-reservations', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = 'SELECT * FROM Reservations WHERE user_id = ? ORDER BY reservation_time DESC';
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Staff Dashboard: Generate a report
app.get('/dashboard/reports', [authenticateToken, authorizeStaff], (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Both startDate and endDate query parameters are required.' });
  }
  const sql = `
    SELECT COUNT(*) AS total_reservations, SUM(party_size) AS total_guests
    FROM Reservations
    WHERE date(reservation_time) BETWEEN ? AND ?`;
  db.get(sql, [startDate, endDate], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(row);
  });
});

// Start the server after setting up email
async function startServer() {
  try {
    await setupEmail();
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();
