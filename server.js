const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3006;

// Database Setup (TiDB Cloud)
const db = mysql.createConnection({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '2zbRQDk3tCQhRnD.root',
    password: '9kBUH8ZpJ7dt1VZj', 
    database: 'test',
    ssl: {
        rejectUnauthorized: true
    }
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
    } else {
        console.log('Connected to MySQL database.');
        db.query(`CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error('Error creating table:', err.message);
        });
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../'))); // Serve frontend from root

// Contact Form Endpoint
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const sql = `INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)`;
    const params = [name, email, subject, message];

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error("Error saving message:", err.message);
            return res.status(500).json({ error: 'Failed to save message.' });
        }
        console.log("Message saved. Sending response to client.");
        res.status(200).json({ 
            message: 'Message sent successfully!',
            id: result.insertId 
        });
    });
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
