// search.js

document.getElementById('searchButton').addEventListener('click', () => {
    const query = document.getElementById('searchBar').value;
    fetch(`/api/search?query=${encodeURIComponent(query)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const resultsContainer = document.getElementById('searchResults');
            resultsContainer.innerHTML = '';
            if (data.length === 0) {
                resultsContainer.innerHTML = '<p>No results found</p>';
            } else {
                data.forEach(pdf => {
                    const link = document.createElement('a');
                    link.href = `/viewer.html?pdf=${encodeURIComponent(pdf)}`;
                    link.textContent = pdf;
                    resultsContainer.appendChild(link);
                    resultsContainer.appendChild(document.createElement('br'));
                });
            }
        })
        .catch(err => {
            console.error('Error searching for PDFs:', err);
            const resultsContainer = document.getElementById('searchResults');
            resultsContainer.innerHTML = `<p>Error searching for PDFs: ${err.message}</p>`;
        });
});
