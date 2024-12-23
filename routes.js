// routes.js

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Function to normalize strings by removing accents
const normalizeString = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

router.get('/search', (req, res) => {
    const query = normalizeString(req.query.query);
    const pdfDir = path.join(__dirname, 'public', 'pdfs');

    fs.readdir(pdfDir, (err, files) => {
        if (err) {
            console.error('Error reading PDF directory:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const results = files.filter(file => normalizeString(file).includes(query));
        res.json(results);
    });
});

module.exports = router;
