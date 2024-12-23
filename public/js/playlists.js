// Playlists data (use localStorage to persist across sessions)
let playlists = JSON.parse(localStorage.getItem("playlists")) || {};

// Elements
const playlistsContainer = document.getElementById("playlists");
const newPlaylistInput = document.getElementById("newPlaylistName");
const createPlaylistButton = document.getElementById("createPlaylistButton");
const playlistDetailsSection = document.getElementById("playlist-details");
const playlistItems = document.getElementById("playlist-items");
const playlistTitle = document.getElementById("playlist-title");
const saveOrderButton = document.getElementById("saveOrderButton");
const backToPlaylistsButton = document.getElementById("backToPlaylistsButton");
const playPlaylistButton = document.getElementById("playPlaylistButton");

// Update playlists list
function updatePlaylistsUI() {
    playlistsContainer.innerHTML = "";
    for (const playlistName in playlists) {
        const playlistDiv = document.createElement("div");
        playlistDiv.textContent = `${playlistName} (${playlists[playlistName].length} files)`;

        // View button
        const viewButton = document.createElement("button");
        viewButton.textContent = "View";
        viewButton.addEventListener("click", () => viewPlaylist(playlistName));

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.style.marginLeft = "10px";
        deleteButton.addEventListener("click", () => {
            const confirmDelete = confirm(`Are you sure you want to delete the playlist \"${playlistName}\"?`);
            if (confirmDelete) {
                deletePlaylist(playlistName);
            }
        });

        playlistDiv.appendChild(viewButton);
        playlistDiv.appendChild(deleteButton);
        playlistsContainer.appendChild(playlistDiv);
    }
}

// Create a new playlist
createPlaylistButton.addEventListener("click", () => {
    const playlistName = newPlaylistInput.value.trim();
    if (playlistName && !playlists[playlistName]) {
        playlists[playlistName] = [];
        localStorage.setItem("playlists", JSON.stringify(playlists));
        updatePlaylistsUI(); // Refresh playlists
        newPlaylistInput.value = ""; // Clear input
    } else {
        alert("Playlist already exists or name is empty!");
    }
});

// View a playlist
function viewPlaylist(playlistName) {
    playlistTitle.textContent = playlistName;
    playlistItems.innerHTML = "";

    playlists[playlistName].forEach((file, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = file;

        const moveUpButton = document.createElement("button");
        moveUpButton.textContent = "Up";
        moveUpButton.disabled = index === 0; // Disable for the first item
        moveUpButton.addEventListener("click", () => moveFile(playlistName, index, -1));

        const moveDownButton = document.createElement("button");
        moveDownButton.textContent = "Down";
        moveDownButton.disabled = index === playlists[playlistName].length - 1; // Disable for the last item
        moveDownButton.addEventListener("click", () => moveFile(playlistName, index, 1));

        listItem.appendChild(moveUpButton);
        listItem.appendChild(moveDownButton);
        playlistItems.appendChild(listItem);
    });

    playlistDetailsSection.style.display = "block";
    document.getElementById("playlists-section").style.display = "none";
}

// Delete a playlist
function deletePlaylist(playlistName) {
    delete playlists[playlistName]; // Remove playlist from object
    localStorage.setItem("playlists", JSON.stringify(playlists)); // Update localStorage
    updatePlaylistsUI(); // Refresh the playlists UI
}

// Play the playlist (open the first file in the viewer)
playPlaylistButton.addEventListener("click", () => {
    const playlistName = playlistTitle.textContent;
    const playlistFiles = playlists[playlistName];
    if (playlistFiles.length > 0) {
        const firstPdf = playlistFiles[0];
        window.location.href = `/viewer.html?pdf=${encodeURIComponent(firstPdf)}&playlist=${encodeURIComponent(playlistName)}`;
    } else {
        alert("This playlist is empty!");
    }
});

// Move a file up or down in the playlist
function moveFile(playlistName, index, direction) {
    const playlist = playlists[playlistName];
    const targetIndex = index + direction;

    // Swap files
    [playlist[index], playlist[targetIndex]] = [playlist[targetIndex], playlist[index]];

    // Update playlist in storage and UI
    localStorage.setItem("playlists", JSON.stringify(playlists));
    viewPlaylist(playlistName);
}

// Back to playlists
backToPlaylistsButton.addEventListener("click", () => {
    playlistDetailsSection.style.display = "none";
    document.getElementById("playlists-section").style.display = "block";
    updatePlaylistsUI(); // Refresh playlists
});

// Initialize UI on page load
document.addEventListener("DOMContentLoaded", () => {
    updatePlaylistsUI(); // Ensure playlists are displayed on load
});
