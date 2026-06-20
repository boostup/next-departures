import './style.css';
import { currentConfig } from './state.js';
import { DEFAULT_STATIONS, API_JOURNEYS_URL, API_PLACES_URL } from './constants.js';
import './components/search-settings/search-settings.js';
import './components/favorites-manager/favorites-manager.js';
import {
    iconStar,
    iconCog,
    iconMapPin,
    iconArrowLeft,
    iconChevronRight,
    iconBus,
    iconTrain,
    iconRefresh,
    iconSearch,
    iconClock,
    iconSun,
    iconMoon
} from './icons/index.js';

let suggestionTimeout = null;

/**
 * Injects SVG icons into all .icon-placeholder elements.
 */
function injectIcons() {
    const iconMap = {
        'star': iconStar,
        'cog': iconCog,
        'map-pin': iconMapPin,
        'arrow-left': iconArrowLeft,
        'chevron-right': iconChevronRight,
        'bus': iconBus,
        'train': iconTrain,
        'refresh': iconRefresh,
        'search': iconSearch,
        'clock': iconClock,
        'sun': iconSun,
        'moon': iconMoon
    };

    document.querySelectorAll('.icon-placeholder').forEach(el => {
        const name = el.dataset.icon;
        const filled = el.dataset.filled === 'true';
        const size = parseInt(el.dataset.size, 10) || 20;
        const iconFn = iconMap[name];
        if (iconFn) {
            el.innerHTML = iconFn({ size, className: '', filled });
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    injectIcons();
    initTheme();
    initNavigationRouter();
    initAutocomplete();
    initBoardControls();

    // Démarrage : Routage automatique ou localisation
    if (currentConfig.autoEnabled && currentConfig.defaultRoute) {
        currentConfig.from = currentConfig.defaultRoute.from;
        currentConfig.to = currentConfig.defaultRoute.to;
        fetchSncbJourneys();
    } else {
        initGeolocationAndProximity();
    }

    // Écouteur réactif général d'état
    window.addEventListener('app-state-changed', (e) => {
        const { property, value } = e.detail;

        if (property === 'label') {
            document.getElementById('route-display').textContent = value;
            updateQuickFavBadge();
        }
        if (property === 'from' || property === 'to' || property === 'autocarRoutesEnabled' || property === 'indirectRoutesEnabled') {
            fetchSncbJourneys();
        }
    });

    document.getElementById('route-display').textContent = currentConfig.label;
    updateQuickFavBadge();
});

function initGeolocationAndProximity() {
    const boardEl = document.getElementById('journeys-board');
    boardEl.innerHTML = '<div class="sys-msg">Calcul de la position GPS...</div>';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const uLat = position.coords.latitude;
                const uLon = position.coords.longitude;

                const distToStGermain = getHaversineDistance(uLat, uLon, DEFAULT_STATIONS.ST_GERMAIN.lat, DEFAULT_STATIONS.ST_GERMAIN.lon);
                const distToVichy = getHaversineDistance(uLat, uLon, DEFAULT_STATIONS.VICHY.lat, DEFAULT_STATIONS.VICHY.lon);

                if (distToVichy < distToStGermain) {
                    currentConfig.from = DEFAULT_STATIONS.VICHY;
                    currentConfig.to = DEFAULT_STATIONS.ST_GERMAIN;
                } else {
                    currentConfig.from = DEFAULT_STATIONS.ST_GERMAIN;
                    currentConfig.to = DEFAULT_STATIONS.VICHY;
                }
            },
            () => {
                currentConfig.from = DEFAULT_STATIONS.ST_GERMAIN;
                currentConfig.to = DEFAULT_STATIONS.VICHY;
            },
            { timeout: 4000 }
        );
    } else {
        currentConfig.from = DEFAULT_STATIONS.ST_GERMAIN;
        currentConfig.to = DEFAULT_STATIONS.VICHY;
    }
}

async function fetchSncbJourneys() {
    const boardEl = document.getElementById('journeys-board');
    boardEl.innerHTML = '<div class="sys-msg">Recherche des trains...</div>';

    const apiKey = import.meta.env.VITE_SNCF_API_KEY;
    if (!apiKey) {
        boardEl.innerHTML = '<div class="sys-msg" style="color: #ff5252;">Clé API manquante dans .env.local</div>';
        return;
    }

    const transfers = currentConfig.indirectRoutesEnabled ? 2 : 0;
    let url = `${API_JOURNEYS_URL}?from=${currentConfig.from.id}&to=${currentConfig.to.id}&max_nb_transfers=${transfers}&count=15`;

    if (!currentConfig.autocarRoutesEnabled) {
        url += '&forbidden_uris%5B%5D=physical_mode%3ACoach&forbidden_uris%5B%5D=physical_mode%3ABus';
    }

    try {
        const response = await fetch(url, { headers: { 'Authorization': apiKey } });
        if (!response.ok) throw new Error();
        const data = await response.json();
        const parsed = parseJourneys(data);
        displayJourneysBoard(parsed);
    } catch (e) {
        boardEl.innerHTML = '<div class="sys-msg" style="color: #ff5252;">Une erreur réseau est survenue. Veuillez réessayer.</div>';
    }
}

function parseJourneys(apiResponse) {
    const journeys = apiResponse.journeys || [];
    return journeys.map(journey => {
        const depTime = journey.departure_date_time;
        const arrTime = journey.arrival_date_time;

        const transitSection = (journey.sections || []).find(sec => sec.type === "public_transport");
        const displayInfo = transitSection?.display_informations || {};

        const physicalMode = (displayInfo.physical_mode || "").toLowerCase();
        const isAutocar = physicalMode.includes("coach") || physicalMode.includes("bus") || physicalMode.includes("autocar");

        return {
            departureTime: depTime,
            arrivalTime: arrTime,
            direction: displayInfo.direction || "Inconnue",
            headsign: displayInfo.headsign || displayInfo.code || "Numéro inconnu",
            isAutocar,
            isDelayed: (transitSection?.base_departure_date_time && transitSection.base_departure_date_time !== depTime)
        };
    });
}

function displayJourneysBoard(departures) {
    const boardEl = document.getElementById('journeys-board');
    boardEl.innerHTML = '';

    if (departures.length === 0) {
        boardEl.innerHTML = '<div class="sys-msg">Aucun itinéraire trouvé.</div>';
        return;
    }

    let lastHeaderDate = "";
    departures.forEach(item => {
        const readableDate = getFormattedDate(item.departureTime);
        if (lastHeaderDate !== readableDate) {
            const dateDivider = document.createElement('div');
            dateDivider.className = 'date-label';
            dateDivider.textContent = readableDate;
            boardEl.appendChild(dateDivider);
        }
        lastHeaderDate = readableDate;

        const clockDep = formatSncfClockTime(item.departureTime);
        const clockArr = formatSncfClockTime(item.arrivalTime);
        const duration = computeDuration(item.departureTime, item.arrivalTime);

        // Choose correct icon based on transport mode
        const modeIcon = item.isAutocar ? iconBus({ size: 12 }) : iconTrain({ size: 12 });
        const modeLabel = item.isAutocar ? 'Autocar' : 'Train';

        const card = document.createElement('div');
        card.className = 'journey-card';
        card.innerHTML = `
            <div class="time-area">
                <div class="time">${clockDep}</div>
                <div class="arrival-time">→ ${clockArr}</div>
                <div class="duration-row">
                    <span class="duration-icon">${iconClock({ size: 14 })}</span>
                    <span>${duration}</span>
                </div>
            </div>
            <div class="details">
                <span class="badge">${modeIcon} ${modeLabel} n° ${item.headsign}</span>
                <span class="badge">Terminus: ${item.direction}</span>
                ${item.isDelayed ? '<div class="status-delayed">Retardé</div>' : ''}
            </div>
        `;
        boardEl.appendChild(card);
    });
}

/**
 * Computes duration between SNCF datetime strings (YYYYMMDDTHHMMSS format)
 * and returns a human-readable French string like "1h 22min".
 */
function computeDuration(departureRaw, arrivalRaw) {
    if (!departureRaw || !arrivalRaw) return "--";
    try {
        const depStr = `${departureRaw.substring(0, 4)}-${departureRaw.substring(4, 6)}-${departureRaw.substring(6, 8)}T${departureRaw.substring(9, 11)}:${departureRaw.substring(11, 13)}:${departureRaw.substring(13, 15)}`;
        const arrStr = `${arrivalRaw.substring(0, 4)}-${arrivalRaw.substring(4, 6)}-${arrivalRaw.substring(6, 8)}T${arrivalRaw.substring(9, 11)}:${arrivalRaw.substring(11, 13)}:${arrivalRaw.substring(13, 15)}`;

        const depDate = new Date(depStr);
        const arrDate = new Date(arrStr);
        const diffMs = arrDate - depDate;

        if (diffMs <= 0) return "--";

        const totalMinutes = Math.round(diffMs / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
        if (hours > 0) return `${hours}h`;
        return `${minutes}min`;
    } catch (e) {
        return "--";
    }
}

function initAutocomplete() {
    const destInput = document.getElementById('dest-input');
    const box = document.getElementById('suggestions-box');
    const okBtn = document.getElementById('search-action-btn');

    destInput.addEventListener('input', () => {
        const query = destInput.value.trim();
        if (suggestionTimeout) clearTimeout(suggestionTimeout);
        if (query.length < 2) {
            box.style.display = 'none';
            return;
        }

        suggestionTimeout = setTimeout(async () => {
            const apiKey = import.meta.env.VITE_SNCF_API_KEY;
            const url = `${API_PLACES_URL}?q=${encodeURIComponent(query)}&type=stop_area&count=5`;
            try {
                const r = await fetch(url, { headers: { 'Authorization': apiKey } });
                const d = await r.json();
                const items = d.places || [];

                if (items.length === 0) {
                    box.style.display = 'none';
                    return;
                }

                box.innerHTML = items.map(p => `
                    <div class="suggestion-item" data-id="${p.id}" data-name="${p.name || p.label}">
                        ${p.name || p.label}
                    </div>
                `).join('');
                box.style.display = 'block';
            } catch (e) {
                box.style.display = 'none';
            }
        }, 250);
    });

    box.addEventListener('click', (e) => {
        const item = e.target.closest('.suggestion-item');
        if (!item) return;

        destInput.value = item.dataset.name;
        currentConfig.to = { id: item.dataset.id, name: item.dataset.name };
        box.style.display = 'none';
    });

    okBtn.addEventListener('click', () => {
        box.style.display = 'none';
        fetchSncbJourneys();
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.autocomplete-container')) {
            box.style.display = 'none';
        }
    });
}

function initBoardControls() {
    const locateBtn = document.getElementById('locate-btn');
    const manualRefreshBtn = document.getElementById('manual-refresh-btn');
    const quickFavBtn = document.getElementById('quick-fav-btn');

    locateBtn.addEventListener('click', () => {
        initGeolocationAndProximity();
    });

    manualRefreshBtn.addEventListener('click', () => {
        fetchSncbJourneys();
    });

    quickFavBtn.addEventListener('click', () => {
        const currentRouteId = `${currentConfig.from.id}-${currentConfig.to.id}`;
        const isFav = currentConfig.favorites.some(f => `${f.from.id}-${f.to.id}` === currentRouteId);

        if (isFav) {
            const match = currentConfig.favorites.find(f => `${f.from.id}-${f.to.id}` === currentRouteId);
            currentConfig.defaultRoute = match;
            currentConfig.autoEnabled = true;
        } else {
            const newFav = { from: currentConfig.from, to: currentConfig.to, label: currentConfig.label };
            currentConfig.favorites = [...currentConfig.favorites, newFav];
            currentConfig.defaultRoute = newFav;
            currentConfig.autoEnabled = true;
        }
        updateQuickFavBadge();
        triggerStarAnimation();
    });
}

function triggerStarAnimation() {
    const btn = document.getElementById('quick-fav-btn');
    btn.classList.remove('animate-star');
    // Force reflow to restart animation
    void btn.offsetWidth;
    btn.classList.add('animate-star');
    btn.addEventListener('animationend', () => {
        btn.classList.remove('animate-star');
    }, { once: true });
}

function updateQuickFavBadge() {
    const quickFavBtn = document.getElementById('quick-fav-btn');
    const iconPlaceholder = quickFavBtn.querySelector('.icon-placeholder');
    const def = currentConfig.defaultRoute;
    const isDefault = def && def.from.id === currentConfig.from.id && def.to.id === currentConfig.to.id;

    if (isDefault) {
        quickFavBtn.classList.add('active');
        quickFavBtn.title = "Trajet par défaut actif";
        quickFavBtn.setAttribute('aria-label', "Trajet par défaut actif");
    } else {
        quickFavBtn.classList.remove('active');
        quickFavBtn.title = "Définir ce trajet comme favori par défaut";
        quickFavBtn.setAttribute('aria-label', "Définir ce trajet comme favori par défaut");
    }

    // Update the star icon inline (filled vs outline)
    if (iconPlaceholder) {
        const size = parseInt(iconPlaceholder.dataset.size, 10) || 24;
        iconPlaceholder.innerHTML = iconStar({ size, className: '', filled: isDefault });
    }
}

function initNavigationRouter() {
    document.getElementById('go-settings-btn').addEventListener('click', () => {
        transitionToScreen('settings');
    });

    document.querySelectorAll('.settings-item').forEach(item => {
        item.addEventListener('click', () => {
            const dest = item.dataset.navigate;
            transitionToScreen(dest);
        });
    });

    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const dest = btn.dataset.target;
            transitionToScreen(dest);
        });
    });
}

function transitionToScreen(screenId) {
    document.querySelectorAll('.view-screen').forEach(scr => {
        scr.classList.remove('active');
    });
    document.getElementById(`view-${screenId}`).classList.add('active');
}

function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    const themeIconEl = document.querySelector('.settings-item-static .icon-placeholder[data-icon="sun"]');
    const userPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    if (userPrefersLight) {
        document.documentElement.classList.add('light-theme');
        toggle.checked = false;
    } else {
        document.documentElement.classList.remove('light-theme');
        toggle.checked = true;
    }

    updateThemeIcon();

    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            document.documentElement.classList.remove('light-theme');
        } else {
            document.documentElement.classList.add('light-theme');
        }
        updateThemeIcon();
    });

    function updateThemeIcon() {
        if (!themeIconEl) return;
        const isDark = document.documentElement.classList.contains('light-theme') === false;
        const size = parseInt(themeIconEl.dataset.size, 10) || 22;
        themeIconEl.innerHTML = isDark ? iconMoon({ size }) : iconSun({ size });
    }
}

function getHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function formatSncfClockTime(rawDate) {
    if (!rawDate) return "--:--";
    return `${rawDate.substring(9, 11)}:${rawDate.substring(11, 13)}`;
}

function getFormattedDate(rawDate) {
    if (!rawDate) return "";
    const year = rawDate.substring(0, 4);
    const month = rawDate.substring(4, 6);
    const day = rawDate.substring(6, 8);

    const dObj = new Date(`${year}-${month}-${day}T12:00:00`);
    const formatted = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).format(dObj);
    return formatted.replace(/\b\w/g, c => c.toUpperCase());
}