pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.8.335/pdf.worker.min.js';

const urlParams = new URLSearchParams(window.location.search);
const pdfUrl = `/pdfs/${urlParams.get('pdf')}`;

const pdfContainer = document.getElementById('pdfContainer');

// Regex to identify chords, including variants like A7, Adim, etc.
const chordRegex = /^[A-G](#|b)?(m|dim|aug|7|6|9|11|13|sus[24])?(\s+[A-G](#|b)?(m|dim|aug|7|6|9|11|13|sus[24])?)*$/;

// Define the order of musical notes
const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Transpose a single chord
const transposeChord = (chord, semitoneShift) => {
    const match = chord.match(/^([A-G](#|b)?)(.*)$/);
    if (match) {
        const baseNote = match[1]; // Extract the base note (e.g., A, A#)
        const modifier = match[3]; // Extract the modifier (e.g., m, 7)

        // Determine the index of the current base note
        let noteIndex = notes.indexOf(baseNote);
        if (noteIndex === -1) {
            // Handle flats by converting them to sharps
            const flatToSharp = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
            noteIndex = notes.indexOf(flatToSharp[baseNote]);
        }

        // Transpose and wrap around using modulo
        const newIndex = (noteIndex + semitoneShift + notes.length) % notes.length;
        return notes[newIndex] + modifier; // Return transposed chord with its modifier
    }
    return chord; // Return unchanged if no match
};

// Function to transpose only chord lines
const transposeChordLines = (lines, semitoneShift) => {
    return lines.map((line, index, allLines) => {
        // Skip lines that should remain hidden
        if (index === 0 || index === 1 || index === 3 || index === allLines.length - 1) {
            return null; // Mark hidden lines
        }

        // Transpose only chord lines
        if (chordRegex.test(line.trim())) {
            return line.replace(/[A-G](#|b)?(m|dim|aug|7|6|9|11|13|sus[24])?/g, chord =>
                transposeChord(chord, semitoneShift)
            );
        }

        // Return non-chord lines unchanged
        return line;
    });
};

// Function to extract and display text content
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

    // Format each line and return
    const formattedLines = lines.map((line) => {
        const lineText = line.text.sort((a, b) => a.x - b.x) // Sort by X-coordinate
            .map(textItem => textItem.content) // Extract content
            .join(''); // Join text items
        return lineText;
    });

    return formattedLines;
};

// Display formatted text content
const displayTextContent = (lines) => {
    pdfContainer.innerHTML = ''; // Clear previous content

    lines.forEach((line, index) => {
        if (line === null) return; // Skip hidden lines

        const preElement = document.createElement('pre');
        if (chordRegex.test(line.trim())) {
            preElement.style.color = 'blue'; // Highlight chord lines
        }
        preElement.textContent = line; // Preserve whitespace and formatting
        pdfContainer.appendChild(preElement);
    });
};

// Load the PDF and extract the first page's text
pdfjsLib.getDocument(pdfUrl).promise
    .then(pdfDoc => pdfDoc.getPage(1))
    .then(page => getPageTextWithFormatting(page))
    .then(lines => {
        let currentLines = [...lines]; // Keep track of the current state of lines

        // Mark lines 1, 2, 4, and last as hidden
        currentLines = currentLines.map((line, index) => {
            if (index === 0 || index === 1 || index === 3 || index === currentLines.length - 1) {
                return null; // Hide these lines
            }
            return line;
        });

        // Add transpose buttons
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.margin = '10px';

        const transposeUpButton = document.createElement('button');
        transposeUpButton.textContent = 'Transpose +1';
        transposeUpButton.addEventListener('click', () => {
            currentLines = transposeChordLines(currentLines, 1);
            displayTextContent(currentLines);
        });

        const transposeDownButton = document.createElement('button');
        transposeDownButton.textContent = 'Transpose -1';
        transposeDownButton.addEventListener('click', () => {
            currentLines = transposeChordLines(currentLines, -1);
            displayTextContent(currentLines);
        });

        buttonsContainer.appendChild(transposeUpButton);
        buttonsContainer.appendChild(transposeDownButton);
        pdfContainer.before(buttonsContainer);

        displayTextContent(currentLines);
    })
    .catch(err => {
        console.error('Error processing PDF:', err);
        pdfContainer.innerHTML = `<p>Error processing PDF: ${err.message}</p>`;
    });
