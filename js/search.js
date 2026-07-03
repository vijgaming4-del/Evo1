"use strict";

/**
 * Search functionality for Evomk
 */

let allApps = [];
const RECENT_SEARCHES_KEY = 'evomk_recent_searches';

async function initSearch() {
    // Load apps data
    try {
        allApps = window.APP_DATA || [];
    } catch (err) {
        console.error('Failed to load apps data:', err);
    }

    const headerSearch = document.getElementById('headerSearch');
    if (headerSearch) {
        setupLiveSearch(headerSearch);
    }

    const heroSearch = document.getElementById('heroSearchInput');
    if (heroSearch) {
        setupLiveSearch(heroSearch);
    }

    // Initialize results page if we are on search.html
    if (window.location.pathname.includes('search.html')) {
        initSearchResultsPage();
    }
}

function setupLiveSearch(input) {
    // Create suggestions dropdown if it doesn't exist
    let dropdown = input.parentElement.querySelector('.suggestions-dropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'suggestions-dropdown';
        input.parentElement.appendChild(dropdown);
    }

    let debounceTimer;

    input.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim().toLowerCase();

        if (query.length < 2) {
            dropdown.classList.remove('active');
            return;
        }

        debounceTimer = setTimeout(() => {
            const suggestions = allApps
                .filter(app => 
                    app.name.toLowerCase().includes(query) || 
                    app.category.toLowerCase().includes(query)
                )
                .slice(0, 5);

            renderSuggestions(suggestions, dropdown);
        }, 300);
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    // Handle enter key
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = input.value.trim();
            if (query) {
                performSearch(query);
            }
        }
    });
}

function renderSuggestions(suggestions, dropdown) {
    if (suggestions.length === 0) {
        dropdown.classList.remove('active');
        return;
    }

    dropdown.innerHTML = suggestions.map(app => `
        <div class="suggestion-item" onclick="window.location.href='/app-detail.html?id=${app.id}'">
            <img src="${app.icon}" alt="${app.name}" loading="lazy" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2232%22%20height%3D%2232%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23eee%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Arial%22%20font-size%3D%228%22%20fill%3D%22%23aaa%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EAPK%3C%2Ftext%3E%3C%2Fsvg%3E'; this.onerror=null;">
            <div class="info">
                <h4>${app.name}</h4>
                <p>${app.category} • v${app.version}</p>
            </div>
        </div>
    `).join('');

    dropdown.classList.add('active');
}

function performSearch(query) {
    if (!query) return;
    
    // Save to recent searches
    saveRecentSearch(query);
    
    window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
}

function saveRecentSearch(query) {
    let recent = getRecentSearches();
    // Remove if already exists to move to top
    recent = recent.filter(q => q.toLowerCase() !== query.toLowerCase());
    recent.unshift(query);
    // Keep only last 10
    recent = recent.slice(0, 10);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
}

function getRecentSearches() {
    const data = localStorage.getItem(RECENT_SEARCHES_KEY);
    return data ? JSON.parse(data) : [];
}

function removeRecentSearch(query) {
    let recent = getRecentSearches();
    recent = recent.filter(q => q !== query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
    // Refresh sidebar if it exists
    renderRecentSearches();
}

async function initSearchResultsPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    const searchTitle = document.getElementById('searchTitle');
    const searchGrid = document.getElementById('searchGrid');
    
    if (!query) return;

    if (searchTitle) searchTitle.innerText = `Results for "${query}"`;
    
    // Wait for apps to load if not already loaded
    if (allApps.length === 0) {
        allApps = window.APP_DATA || [];
    }

    renderRecentSearches();
    setupFiltersAndSorting(query);
    filterAndRenderResults(query);
}

function setupFiltersAndSorting(query) {
    const filters = document.querySelectorAll('.filter-tab');
    filters.forEach(tab => {
        tab.addEventListener('click', () => {
            filters.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filterAndRenderResults(query);
        });
    });

    const sortSelect = document.getElementById('searchSort');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => filterAndRenderResults(query));
    }
}

function filterAndRenderResults(query) {
    const activeTab = document.querySelector('.filter-tab.active')?.dataset.type || 'all';
    const sortType = document.getElementById('searchSort')?.value || 'latest';
    const grid = document.getElementById('searchGrid');
    
    let filtered = allApps.filter(app => 
        app.name.toLowerCase().includes(query.toLowerCase()) || 
        app.category.toLowerCase().includes(query.toLowerCase()) ||
        app.developer.toLowerCase().includes(query.toLowerCase())
    );

    // Apply Tab Filter
    if (activeTab === 'apps') {
        filtered = filtered.filter(app => !app.isGame);
    } else if (activeTab === 'games') {
        filtered = filtered.filter(app => app.isGame);
    } else if (activeTab !== 'all') {
        filtered = filtered.filter(app => app.category.toLowerCase() === activeTab.toLowerCase());
    }

    // Apply Sorting
    if (sortType === 'latest') {
        filtered.sort((a, b) => new Date(b.updated) - new Date(a.updated));
    } else if (sortType === 'popular') {
        filtered.sort((a, b) => {
            const getVal = (v) => parseFloat(v.replace(/[^\d.]/g, '')) * (v.includes('B') ? 1000 : 1);
            return getVal(b.downloads) - getVal(a.downloads);
        });
    } else if (sortType === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
    }

    renderResults(filtered, grid);
}

function renderResults(results, grid) {
    if (!grid) return;

    if (results.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 20px;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                <h3>No results found</h3>
                <p style="color: #666; margin-top: 10px;">Try searching for popular apps like "WhatsApp" or "Subway Surfers".</p>
                <div style="margin-top: 30px;">
                    <p style="font-weight: 600; margin-bottom: 15px;">Suggested for you:</p>
                    <div class="app-grid-4" id="suggestionsGrid"></div>
                </div>
            </div>
        `;
        
        // Show some suggestions
        const suggestionsGrid = document.getElementById('suggestionsGrid');
        if (suggestionsGrid) {
            const suggestions = allApps.filter(a => a.featured).slice(0, 4);
            renderAppsToGrid(suggestions, suggestionsGrid);
        }
        return;
    }

    renderAppsToGrid(results, grid);
}

function renderAppsToGrid(apps, grid) {
    grid.innerHTML = apps.map(app => `
        <div class="app-card">
            <a href="/app-detail.html?id=${app.id}">
                <img src="${app.icon}" alt="${app.name}" class="app-icon" loading="lazy" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2280%22%20height%3D%2280%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23eee%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20fill%3D%22%23aaa%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EAPK%3C%2Ftext%3E%3C%2Fsvg%3E'; this.onerror=null;">
                <div class="app-info">
                    <h3 class="app-name">${app.name}</h3>
                    <div class="app-meta">
                        <span class="category">${app.category}</span>
                        <span class="rating">★ ${app.rating}</span>
                    </div>
                    <div class="app-details-row">
                        <span>${app.size}</span>
                        <span>v${app.version}</span>
                    </div>
                </div>
            </a>
            <a href="/app-detail.html?id=${app.id}" class="download-btn">Download</a>
        </div>
    `).join('');
}

function renderRecentSearches() {
    const container = document.getElementById('recentSearchesList');
    if (!container) return;

    const recent = getRecentSearches();
    if (recent.length === 0) {
        container.innerHTML = '<p style="font-size: 13px; color: #999;">No recent searches</p>';
        return;
    }

    container.innerHTML = recent.map(query => `
        <li class="recent-item">
            <a href="/search.html?q=${encodeURIComponent(query)}">${query}</a>
            <button class="remove-search-btn" data-query="${query}">&times;</button>
        </li>
    `).join('');

    // Add event listeners programmatically
    container.querySelectorAll('.remove-search-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const query = e.target.dataset.query;
            removeRecentSearch(query);
        });
    });
}

// Initialize on module load
document.addEventListener('DOMContentLoaded', initSearch);
