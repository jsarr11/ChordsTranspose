// server.js

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Import routes from routes.js
const routes = require('./routes');
app.use('/api', routes);

// Route to serve PDF files
app.get('/pdfs/:pdfName', (req, res) => {
    const pdfName = req.params.pdfName;
    const pdfPath = path.join(__dirname, 'public', 'pdfs', pdfName);
    res.sendFile(pdfPath);
});

// Default route to serve the index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
