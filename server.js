const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

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

    const newMessage = {
        id: Date.now(),
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString()
    };

    const filePath = path.join(__dirname, 'contact_messages.json');

    // Read existing messages
    fs.readFile(filePath, 'utf8', (err, data) => {
        let messages = [];
        if (!err && data) {
            try {
                messages = JSON.parse(data);
            } catch (e) {
                console.error("Error parsing messages:", e);
                messages = [];
            }
        }

        messages.push(newMessage);

        // Write back to file
        fs.writeFile(filePath, JSON.stringify(messages, null, 2), (err) => {
            if (err) {
                console.error("Error saving message:", err);
                return res.status(500).json({ error: 'Failed to save message.' });
            }
            res.status(200).json({ message: 'Message sent successfully!' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
