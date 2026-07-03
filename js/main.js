"use strict";

// Consolidate initialization
document.addEventListener('DOMContentLoaded', () => {
    // Immediate loader fallback
    const hideLoader = () => {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.visibility = 'hidden';
                document.body.classList.remove('loading');
            }, 500);
        } else {
            document.body.classList.remove('loading');
        }
    };
    
    // Set a fallback timeout in case something hangs (AdSense, etc.)
    setTimeout(hideLoader, 2500);

    try {
        initHeader();
        initUX();
        
        // Page-specific initialization based on element presence
        const featuredGrid = document.getElementById('featuredGrid');
        const latestGrid = document.getElementById('latestGrid');
        const appsGrid = document.getElementById('appsGrid');
        const gamesGrid = document.getElementById('gamesGrid');

        if (featuredGrid || latestGrid) {
            loadApps().finally(hideLoader);
        } else if (appsGrid) {
            initAppsPage().finally(hideLoader);
        } else if (gamesGrid) {
            initGamesPage().finally(hideLoader);
        } else {
            // No dynamic grids found, hide loader
            hideLoader();
        }
        
        const searchTrigger = document.getElementById('searchTrigger');
        if (searchTrigger) {
            searchTrigger.addEventListener('click', () => {
                window.location.href = '/search.html';
            });
        }
    } catch (err) {
        console.error('Initialization error:', err);
        hideLoader(); // Hide loader even on error
    }
});

async function initAppsPage() {
    try {
        const apps = window.APP_DATA || [];
        
        // Sort by date
        apps.sort((a, b) => new Date(b.updated) - new Date(a.updated));

        const grid = document.getElementById('appsGrid');
        const filteredApps = apps.filter(app => !app.isGame);
        
        if (grid) {
            renderAppsToListGrid(filteredApps, grid);
        }

        // Mobile Filter Toggle
        const toggle = document.getElementById('filterToggle');
        const sidebar = document.getElementById('sidebar');
        if (toggle && sidebar) {
            toggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
    } catch (err) {
        console.error('Error in apps page:', err);
    }
}

async function initGamesPage() {
    try {
        const apps = window.APP_DATA || [];
        
        // Sort by date
        apps.sort((a, b) => new Date(b.updated) - new Date(a.updated));

        const grid = document.getElementById('gamesGrid');
        const filteredApps = apps.filter(app => app.isGame);
        
        if (grid) {
            renderAppsToListGrid(filteredApps, grid);
        }
    } catch (err) {
        console.error('Error in games page:', err);
    }
}

function renderAppsToListGrid(apps, grid) {
    grid.innerHTML = apps.map(app => `
        <div class="app-card-list">
            <div class="app-card-list-top">
                <img src="${app.icon}" alt="${app.name}" loading="lazy" onerror="this.src='/assets/default-icon.png'; this.onerror=null;">
                <div class="app-card-list-info">
                    <h3>${app.name}</h3>
                    <p>${app.developer}</p>
                    <div style="color: #fbbc05; font-size: 13px; margin-top: 5px;">
                        ${app.rating} ★ <span style="color: #666; font-size: 11px;">(12K)</span>
                    </div>
                </div>
            </div>
            <div class="app-card-list-meta">
                <span class="category-badge">${app.category}</span>
                <span>${app.size} | v${app.version}</span>
            </div>
            <a href="/app-detail.html?id=${app.id}" class="btn-download-sm">Download APK</a>
        </div>
    `).join('');
}

function initUX() {
    // 1. Page Loader - Fallback already handled in DOMContentLoaded, 
    // but we'll keep the window load event as an additional trigger
    window.addEventListener('load', () => {
        const loader = document.getElementById('page-loader');
        if (loader && loader.style.visibility !== 'hidden') {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.visibility = 'hidden';
                if (typeof safePushAds === 'function') safePushAds();
            }, 500);
        }
    });

    // 2. Back to Top
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 3. Dark Mode Toggle
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon('dark');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', theme);
            updateThemeIcon(theme);
        });
    }

    function updateThemeIcon(theme) {
        if (!themeToggle) return;
        themeToggle.innerHTML = theme === 'dark' 
            ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
            : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }

    // 4. Cookie Consent
    const cookieConsent = document.getElementById('cookieConsent');
    const acceptBtn = document.getElementById('acceptCookies');
    const declineBtn = document.getElementById('declineCookies');

    if (cookieConsent && !localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => {
            cookieConsent.classList.add('show');
        }, 2000);
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            cookieConsent.classList.remove('show');
        });
    }

    if (declineBtn) {
        declineBtn.addEventListener('click', () => {
            cookieConsent.classList.remove('show');
        });
    }

    // 5. Image Lazy Loading with Blur
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('img-blur');
                    img.addEventListener('load', () => {
                        img.classList.add('img-loaded');
                    });
                    imageObserver.unobserve(img);
                }
            });
        });
        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // 6. Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 7. Toast Notification Helper
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Global exposure for non-module compatibility
/**
 * Safely initialize AdSense units that are visible
 */
function safePushAds() {
    try {
        if (typeof window.adsbygoogle !== 'undefined') {
            const ads = document.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status="done"])');
            if (ads.length > 0) {
                ads.forEach(() => {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                });
            }
        }
    } catch (e) {
        console.error('AdSense error:', e);
    }
}

if (typeof window !== 'undefined') {
    window.showToast = showToast;
    window.safePushAds = safePushAds;
}

function initHeader() {
    const header = document.getElementById('mainHeader');
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');

    // Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Toggle
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
        });

        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });
    }
}



async function loadApps() {
    try {
        const apps = window.APP_DATA || [];
        
        // Sort by date (descending)
        apps.sort((a, b) => new Date(b.updated) - new Date(a.updated));
        
        // 1. Featured Slider
        const featuredGrid = document.getElementById('featuredGrid');
        if (featuredGrid) {
            const featuredApps = apps.filter(app => app.featured);
            featuredGrid.innerHTML = featuredApps.map(app => `
                <a href="/app-detail.html?id=${app.id}" class="featured-card">
                    <img src="${app.icon}" alt="${app.name}" loading="lazy" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2280%22%20height%3D%2280%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23eee%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20fill%3D%22%23aaa%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EAPK%3C%2Ftext%3E%3C%2Fsvg%3E'; this.onerror=null;" style="width: 80px; border-radius: 18px; margin-bottom: 12px;">
                    <h3 style="font-size: 15px; margin-bottom: 5px;">${app.name}</h3>
                    <p style="font-size: 12px; color: #666; margin-bottom: 10px;">${app.category}</p>
                    <div style="font-size: 13px; color: #fbbc05;">${app.rating} ★</div>
                </a>
            `).join('');
        }

        // 2. Latest Apps Grid (4 columns, long cards)
        const latestGrid = document.getElementById('latestGrid');
        if (latestGrid) {
            const latestApps = apps.filter(app => !app.isGame).slice(0, 12);
            latestGrid.innerHTML = latestApps.map(app => `
                <a href="/app-detail.html?id=${app.id}" class="app-card-long">
                    <img src="${app.icon}" alt="${app.name}" loading="lazy" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23eee%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Arial%22%20font-size%3D%2210%22%20fill%3D%22%23aaa%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EAPK%3C%2Ftext%3E%3C%2Fsvg%3E'; this.onerror=null;">
                    <div class="app-card-info">
                        <h3>${app.name}</h3>
                        <p>${app.developer}</p>
                        <div style="display: flex; gap: 8px; margin-top: 5px; align-items: center;">
                            <span class="category-badge">${app.category}</span>
                            <span style="font-size: 11px; font-weight: 600;">${app.rating} ★</span>
                        </div>
                    </div>
                </a>
            `).join('');
        }

        // 3. Top Games (Slider)
        const gamesGrid = document.getElementById('gamesGrid');
        if (gamesGrid) {
            const games = apps.filter(app => app.isGame).slice(0, 8);
            gamesGrid.innerHTML = games.map(app => `
                <a href="/app-detail.html?id=${app.id}" class="featured-card">
                    <img src="${app.icon}" alt="${app.name}" loading="lazy" style="width: 80px; border-radius: 18px; margin-bottom: 12px;">
                    <h3>${app.name}</h3>
                    <p>${app.category}</p>
                    <div style="margin-top: 5px;">${app.rating} ★</div>
                </a>
            `).join('');
        }

        // 4. Recently Updated
        const recentlyGrid = document.getElementById('recentlyGrid');
        if (recentlyGrid) {
            const updatedApps = [...apps].sort((a, b) => 0.5 - Math.random()).slice(0, 4);
            recentlyGrid.innerHTML = updatedApps.map(app => `
                <a href="/app-detail.html?id=${app.id}" class="app-card-long">
                    <img src="${app.icon}" alt="${app.name}" loading="lazy" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23eee%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Arial%22%20font-size%3D%2210%22%20fill%3D%22%23aaa%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EAPK%3C%2Ftext%3E%3C%2Fsvg%3E'; this.onerror=null;">
                    <div class="app-card-info">
                        <h3>${app.name}</h3>
                        <p>Updated: ${app.updated}</p>
                        <span class="category-badge" style="margin-top: 5px; display: inline-block;">${app.size}</span>
                    </div>
                </a>
            `).join('');
        }

    } catch (error) {
        console.error('Error loading apps:', error);
    }
}

function renderApps(apps, container) {
    container.innerHTML = apps.map(app => `
        <a href="/app-detail.html?id=${app.id}" class="app-card" id="app-${app.id}">
            <img src="${app.icon}" alt="${app.name}" loading="lazy" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2280%22%20height%3D%2280%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23eee%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20fill%3D%22%23aaa%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EAPK%3C%2Ftext%3E%3C%2Fsvg%3E'; this.onerror=null;">
            <h3>${app.name}</h3>
            <p>${app.category}</p>
        </a>
    `).join('');
}

