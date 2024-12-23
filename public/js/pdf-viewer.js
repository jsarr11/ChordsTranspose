pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.8.335/pdf.worker.min.js';

const urlParams = new URLSearchParams(window.location.search);
const pdfUrl = `/pdfs/${urlParams.get('pdf')}`;

const pdfContainer = document.getElementById('pdfContainer');

// Regex to identify lines that contain chords
const chordRegex = /^([A-G](#|b)?m?\s*)+$/;

// Function to extract and display text content with line-by-line formatting
const getPageTextWithFormatting = async (page) => {
    const textContent = await page.getTextContent();
    const lines = [];

    // Process text items to reconstruct lines
    textContent.items.forEach((item) => {
        const { str, transform } = item; // `str` is the text, `transform` gives position info
        const yPosition = Math.floor(transform[5]); // Y-coordinate, rounded for grouping lines
        const xPosition = transform[4]; // X-coordinate

        // Find existing line at the same yPosition or create a new one
        let line = lines.find(line => line.y === yPosition);
        if (!line) {
            line = { y: yPosition, text: [] };
            lines.push(line);
        }

        // Add the text and x-position for sorting later
        line.text.push({ x: xPosition, content: str });
    });

    // Sort lines by Y-coordinate in descending order (top to bottom of the page)
    lines.sort((a, b) => b.y - a.y);

    // Format each line and check for chords
    const formattedLines = lines.map((line) => {
        const lineText = line.text.sort((a, b) => a.x - b.x) // Sort by X-coordinate
            .map(textItem => textItem.content) // Extract content
            .join(''); // Join text items
        return lineText;
    });

    return formattedLines;
};

// Display formatted text content with chords highlighted
const displayTextContent = (lines) => {
    pdfContainer.innerHTML = ''; // Clear previous content

    lines.forEach((line) => {
        const preElement = document.createElement('pre');
        if (chordRegex.test(line.trim())) {
            // If the line matches the chord pattern, apply blue color
            preElement.style.color = 'blue';
        }
        preElement.textContent = line; // Preserve whitespace and formatting
        pdfContainer.appendChild(preElement);
    });
};

// Load the PDF and extract the first page's text
pdfjsLib.getDocument(pdfUrl).promise
    .then(pdfDoc => pdfDoc.getPage(1))
    .then(page => getPageTextWithFormatting(page))
    .then(lines => displayTextContent(lines))
    .catch(err => {
        console.error('Error processing PDF:', err);
        pdfContainer.innerHTML = `<p>Error processing PDF: ${err.message}</p>`;
    });
