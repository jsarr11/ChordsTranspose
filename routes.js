// routes.js

const express = require('express');
const router = express.Router();

// A basic GET endpoint
router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API!' });
});

// Add more routes as needed
router.get('/hello', (req, res) => {
    res.json({ message: 'Hello, world!' });
});

module.exports = router;
