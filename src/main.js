import './style.css';
import { currentConfig } from './state.js';
import { DEFAULT_STATIONS, API_JOURNEYS_URL, API_PLACES_URL } from './constants.js';
import './components/search-settings/search-settings.js';
import './components/favorites-manager/favorites-manager.js';

let suggestionTimeout = null;

document.addEventListener('DOMContentLoaded', () => {
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
        triggerGeolocationAndProximity();
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

function triggerGeolocationAndProximity() {
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
        const parsed = parseDirectJourneys(data);
        displayJourneysBoard(parsed);
    } catch (e) {
        boardEl.innerHTML = '<div class="sys-msg" style="color: #ff5252;">Une erreur réseau est survenue. Veuillez réessayer.</div>';
    }
}

function parseDirectJourneys(apiResponse) {
    const journeys = apiResponse.journeys || [];
    return journeys.map(journey => {
        const depTime = journey.departure_date_time;
        const arrTime = journey.arrival_date_time;

        const transitSection = (journey.sections || []).find(sec => sec.type === "public_transport");
        const displayInfo = transitSection?.display_informations || {};

        return {
            departureTime: depTime,
            arrivalTime: arrTime,
            direction: displayInfo.direction || "Inconnue",
            headsign: displayInfo.headsign || displayInfo.code || "Numéro inconnu",
            isAutocar: (displayInfo.physical_mode || "").toLowerCase().includes("coach") || (displayInfo.physical_mode || "").toLowerCase().includes("bus"),
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

        const clockDep = formatSncftClockTime(item.departureTime);
        const clockArr = formatSncftClockTime(item.arrivalTime);

        const card = document.createElement('div');
        card.className = 'journey-card';
        // HTML dynamique minimaliste avec directive /*html*/ pour coloration VS Code
        card.innerHTML = /*html*/`
            <div class="time-area">
                <div class="time">${clockDep}</div>
                <div class="arrival-time">Arrivée prévue à ${clockArr}</div>
            </div>
            <div class="details">
                <span class="badge">${item.isAutocar ? '🚌 Autocar' : '🚄 Train'} n° ${item.headsign}</span>
                <span class="badge">Terminus: ${item.direction}</span>
                ${item.isDelayed ? '<div class="status-delayed">Retardé</div>' : ''}
            </div>
        `;
        boardEl.appendChild(card);
    });
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
        triggerGeolocationAndProximity();
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
    });
}

function updateQuickFavBadge() {
    const quickFavBtn = document.getElementById('quick-fav-btn');
    const def = currentConfig.defaultRoute;
    const isDefault = def && def.from.id === currentConfig.from.id && def.to.id === currentConfig.to.id;

    if (isDefault) {
        quickFavBtn.textContent = '★';
        quickFavBtn.classList.add('active');
        quickFavBtn.title = "Trajet par défaut actif";
    } else {
        quickFavBtn.textContent = '☆';
        quickFavBtn.classList.remove('active');
        quickFavBtn.title = "Définir ce trajet comme favori par défaut";
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
    const userPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    if (userPrefersLight) {
        document.documentElement.classList.add('light-theme');
        toggle.checked = false;
    } else {
        document.documentElement.classList.remove('light-theme');
        toggle.checked = true;
    }

    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            document.documentElement.classList.remove('light-theme');
        } else {
            document.documentElement.classList.add('light-theme');
        }
    });
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

function formatSncftClockTime(rawDate) {
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