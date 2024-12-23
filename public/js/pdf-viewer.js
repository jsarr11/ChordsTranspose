pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.8.335/pdf.worker.min.js';

const urlParams = new URLSearchParams(window.location.search);
const pdfUrl = `/pdfs/${urlParams.get('pdf')}`;

const pdfContainer = document.getElementById('pdfContainer');

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

    // Format and log each line
    let lineNumber = 1; // Start line numbering from 1
    const allLines = lines.map((line) => {
        const lineText = line.text.sort((a, b) => a.x - b.x) // Sort by X-coordinate
            .map(textItem => textItem.content) // Extract content
            .join(''); // Join text items
        console.log(`Line ${lineNumber}: ${lineText}`); // Log each line with its number
        lineNumber++; // Increment the line number
        return lineText; // Return the plain text for processing
    });

    // Filter out the first, second, fourth, and last lines for display
    const filteredLines = allLines.filter((_, index) => {
        const lastIndex = allLines.length - 1;
        return index !== 0 && index !== 1 && index !== 3 && index !== lastIndex;
    });

    // Join the remaining lines with newlines
    return filteredLines.join('\n');
};

// Display formatted text content in the container
const displayTextContent = (text) => {
    const preElement = document.createElement('pre');
    preElement.textContent = text; // Display filtered text
    pdfContainer.innerHTML = '';
    pdfContainer.appendChild(preElement);
};

// Load the PDF and extract the first page's text
pdfjsLib.getDocument(pdfUrl).promise
    .then(pdfDoc => pdfDoc.getPage(1))
    .then(page => getPageTextWithFormatting(page))
    .then(text => displayTextContent(text))
    .catch(err => {
        console.error('Error processing PDF:', err);
        pdfContainer.innerHTML = `<p>Error processing PDF: ${err.message}</p>`;
    });
