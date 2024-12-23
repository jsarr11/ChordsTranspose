pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.8.335/pdf.worker.min.js';

const urlParams = new URLSearchParams(window.location.search);
const pdfUrl = `/pdfs/${urlParams.get('pdf')}`;
const pdfName = decodeURIComponent(urlParams.get('pdf')); // Get current PDF name
const playlistName = urlParams.get('playlist'); // Get playlist name if navigating from a playlist
let playlists = JSON.parse(localStorage.getItem("playlists")) || {}; // Playlists stored in localStorage
let currentPlaylistFiles = playlistName ? playlists[playlistName] : []; // Files in the current playlist
let currentFileIndex = currentPlaylistFiles.indexOf(pdfName); // Index of the current file in the playlist

const pdfContainer = document.getElementById('pdfContainer');
const playlistButtonsContainer = document.getElementById("playlist-buttons");
const addStatus = document.getElementById("add-status");

// Add styles for chord lines
const style = document.createElement('style');
style.textContent = `
    #pdfContainer pre {
        margin: 0;
        line-height: 1.5;
    }
    #pdfContainer pre.below-chord {
        margin-top: -5px;
    }
`;
document.head.appendChild(style);

// Regex to identify chord lines
const chordRegex = /^[A-G](#|b)?(m|dim|aug|7|6|9|11|13|sus[24])?(\s+[A-G](#|b)?(m|dim|aug|7|6|9|11|13|sus[24])?)*$/;

// Define musical notes for transposition
const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Function to transpose chords
const transposeChord = (chord, semitoneShift) => {
    const match = chord.match(/^([A-G](#|b)?)(.*)$/);
    if (match) {
        const baseNote = match[1];
        const modifier = match[3];
        let noteIndex = notes.indexOf(baseNote);
        if (noteIndex === -1) {
            const flatToSharp = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
            noteIndex = notes.indexOf(flatToSharp[baseNote]);
        }
        const newIndex = (noteIndex + semitoneShift + notes.length) % notes.length;
        return notes[newIndex] + modifier;
    }
    return chord;
};

// Transpose chord lines
const transposeChordLines = (lines, semitoneShift) => {
    return lines.map((line, index, allLines) => {
        if (index === 0 || index === 1 || index === 3 || index === allLines.length - 1) {
            return null; // Skip hidden lines
        }
        if (chordRegex.test(line.trim())) {
            return line.replace(/[A-G](#|b)?(m|dim|aug|7|6|9|11|13|sus[24])?/g, chord =>
                transposeChord(chord, semitoneShift)
            );
        }
        return line;
    });
};

// Extract and display text content
const getPageTextWithFormatting = async (page) => {
    const textContent = await page.getTextContent();
    const lines = [];
    textContent.items.forEach(({ str, transform }) => {
        const yPosition = Math.floor(transform[5]);
        const xPosition = transform[4];
        let line = lines.find(line => line.y === yPosition);
        if (!line) {
            line = { y: yPosition, text: [] };
            lines.push(line);
        }
        line.text.push({ x: xPosition, content: str });
    });
    lines.sort((a, b) => b.y - a.y);
    return lines.map(line => line.text.sort((a, b) => a.x - b.x).map(item => item.content).join(''));
};

// Display formatted text content
const displayTextContent = (lines) => {
    pdfContainer.innerHTML = '';
    lines.forEach((line, index) => {
        if (line === null) return;
        const preElement = document.createElement('pre');
        if (chordRegex.test(line.trim())) {
            preElement.style.color = 'blue';
        } else if (index > 0 && chordRegex.test(lines[index - 1]?.trim())) {
            preElement.classList.add('below-chord');
        }
        preElement.textContent = line;
        pdfContainer.appendChild(preElement);
    });
};

// Fetch and display the PDF content
pdfjsLib.getDocument(pdfUrl).promise
    .then(pdfDoc => pdfDoc.getPage(1))
    .then(page => getPageTextWithFormatting(page))
    .then(lines => {
        let currentLines = [...lines];
        currentLines = currentLines.map((line, index) => {
            if (index === 0 || index === 1 || index === 3 || index === currentLines.length - 1) {
                return null;
            }
            return line;
        });
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

// ADD TO PLAYLIST FUNCTIONALITY

function updatePlaylistButtons() {
    playlistButtonsContainer.innerHTML = "";
    for (const playlistName in playlists) {
        const button = document.createElement("button");
        button.textContent = playlistName;
        button.addEventListener("click", () => {
            addToPlaylist(playlistName);
        });
        playlistButtonsContainer.appendChild(button);
    }
}

function addToPlaylist(playlistName) {
    if (!playlists[playlistName].includes(pdfName)) {
        playlists[playlistName].push(pdfName);
        localStorage.setItem("playlists", JSON.stringify(playlists));
        addStatus.style.display = "block";
        setTimeout(() => {
            addStatus.style.display = "none";
        }, 2000);
    } else {
        alert(`${pdfName} is already in "${playlistName}"`);
    }
}

// Playlist Navigation
document.getElementById("prevInPlaylist").addEventListener("click", () => {
    if (currentFileIndex > 0) {
        currentFileIndex--;
        window.location.href = `/viewer.html?pdf=${encodeURIComponent(currentPlaylistFiles[currentFileIndex])}&playlist=${encodeURIComponent(playlistName)}`;
    }
});

document.getElementById("nextInPlaylist").addEventListener("click", () => {
    if (currentFileIndex < currentPlaylistFiles.length - 1) {
        currentFileIndex++;
        window.location.href = `/viewer.html?pdf=${encodeURIComponent(currentPlaylistFiles[currentFileIndex])}&playlist=${encodeURIComponent(playlistName)}`;
    }
});

// Initialize playlist buttons
updatePlaylistButtons();
