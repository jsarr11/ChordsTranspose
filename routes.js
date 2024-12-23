// routes.js

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/search', (req, res) => {
    const query = req.query.query.toLowerCase();
    const pdfDir = path.join(__dirname, 'public', 'pdfs');

    fs.readdir(pdfDir, (err, files) => {
        if (err) {
            console.error('Error reading PDF directory:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const results = files.filter(file => file.toLowerCase().includes(query));
        res.json(results);
    });
});

module.exports = router;
