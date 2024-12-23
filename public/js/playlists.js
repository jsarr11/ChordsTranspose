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

// Update playlists list
function updatePlaylistsUI() {
    playlistsContainer.innerHTML = "";
    for (const playlistName in playlists) {
        const playlistDiv = document.createElement("div");
        playlistDiv.textContent = `${playlistName} (${playlists[playlistName].length} files)`;

        const viewButton = document.createElement("button");
        viewButton.textContent = "View";
        viewButton.addEventListener("click", () => viewPlaylist(playlistName));

        playlistDiv.appendChild(viewButton);
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

    // Show playlist details section
    playlistDetailsSection.style.display = "block";
    document.getElementById("playlists-section").style.display = "none";
}

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

// Save playlist order
saveOrderButton.addEventListener("click", () => {
    alert("Playlist order saved!");
});

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
