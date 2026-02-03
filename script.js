// API Configuration
const API_KEY = 'a600dc72'; // Replace with your OMDb API key
const API_URL = ' http://www.omdbapi.com/?i=tt3896198&apikey=a600dc72';

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultContainer = document.getElementById('result-container');
const sortSelect = document.getElementById('sort-select');

// Event Listeners
searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});
sortSelect.addEventListener('change', () => {
    // If we have results stored, we could re-sort them without re-fetching
    // For now, let's just trigger a search if there's a query
    if (searchInput.value.trim()) {
        performSearch();
    }
});

// Store current results for sorting without re-fetching
let currentResults = [];

async function performSearch() {
    const query = searchInput.value.trim();
    const sortValue = sortSelect.value;
    
    if (!query) {
        alert('Please enter a movie name');
        return;
    }

    // Show loading state
    resultContainer.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">Searching...</p>';

    try {
        // Construct API URL
        const url = `${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=movie`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.Response === "True") {
            currentResults = data.Search; // Store results
            
            // Sort results
            const sortedResults = sortResults(currentResults, sortValue);
            
            displayMovies(sortedResults);
        } else {
            currentResults = [];
            resultContainer.innerHTML = `
                <div class="placeholder-message">
                    <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 1rem; color: #444;"></i>
                    <p>${data.Error || "No movies found."}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        resultContainer.innerHTML = `
            <div class="placeholder-message">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; color: #444;"></i>
                <p>Something went wrong. Please check your API key and internet connection.</p>
            </div>
        `;
    }
}

function sortResults(movies, sortType) {
    const sorted = [...movies];
    
    switch(sortType) {
        case 'az':
            return sorted.sort((a, b) => a.Title.localeCompare(b.Title));
        case 'za':
            return sorted.sort((a, b) => b.Title.localeCompare(a.Title));
        case 'newest':
            return sorted.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
        case 'oldest':
            return sorted.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
        default: // 'relevance' - API returns by relevance usually, so just return original order
            return sorted;
    }
}

function displayMovies(movies) {
    resultContainer.innerHTML = '';

    if (!movies || movies.length === 0) {
        resultContainer.innerHTML = `
            <div class="placeholder-message">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 1rem; color: #444;"></i>
                <p>No movies found matching your criteria.</p>
            </div>
        `;
        return;
    }

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        
        // Handle missing posters
        const posterSrc = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Poster";
        
        movieCard.innerHTML = `
            <img src="${posterSrc}" alt="${movie.Title}" class="movie-poster">
            <div class="movie-info">
                <h3 class="movie-title">${movie.Title}</h3>
                <p class="movie-year">${movie.Year}</p>
            </div>
        `;
        
        resultContainer.appendChild(movieCard);
    });
}
