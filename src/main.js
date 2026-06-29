import './style.css';
import { currentConfig } from './state.js';
import { DEFAULT_STATIONS, API_JOURNEYS_URL, API_PLACES_URL } from './constants.js';
import './components/search-settings/search-settings.js';
import './components/favorites-manager/favorites-manager.js';
import {
    iconStar,
    iconCog,
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

function getApiKey() {
    return currentConfig.apiKey || '';
}

/**
 * Injects SVG icons into all .icon-placeholder elements.
 */
function injectIcons() {
    const iconMap = {
        'star': iconStar,
        'cog': iconCog,
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

    const apiKey = getApiKey();
    if (!apiKey) {
        showApiKeyGate();
    } else {
        initMainApp();
    }
});

function showApiKeyGate() {
    transitionToScreen('api-key');
    const input = document.getElementById('api-key-input');
    const submitBtn = document.getElementById('api-key-submit');
    const errorEl = document.getElementById('api-key-error');

    input.value = '';
    errorEl.style.display = 'none';

    const submitKey = () => {
        const key = input.value.trim();
        if (!key) {
            errorEl.style.display = 'block';
            return;
        }
        currentConfig.apiKey = key;
        errorEl.style.display = 'none';
        initMainApp();
    };

    submitBtn.addEventListener('click', submitKey);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submitKey();
    });
    input.focus();
}

function initMainApp() {
    initAutocomplete();
    initBoardControls();
    initApiKeySettings();

    // Set up state change listener before any route changes
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

    // If a default route exists, fetch journeys automatically (from/to already set in state.js)
    if (currentConfig.defaultRoute) {
        fetchSncbJourneys();
    } else {
        initGeolocationAndProximity();
    }

    document.getElementById('route-display').textContent = currentConfig.label;
    updateQuickFavBadge();
    transitionToScreen('board');
}

function initApiKeySettings() {
    const settingsInput = document.getElementById('api-key-settings-input');
    const saveBtn = document.getElementById('api-key-settings-save');
    const clearBtn = document.getElementById('api-key-clear-btn');
    const msgEl = document.getElementById('api-key-settings-msg');

    const syncInput = () => {
        settingsInput.value = currentConfig.apiKey || '';
    };

    syncInput();

    const stateListener = () => syncInput();
    window.addEventListener('app-state-changed', stateListener);

    saveBtn.addEventListener('click', () => {
        const key = settingsInput.value.trim();
        if (!key) {
            msgEl.textContent = 'Veuillez entrer une clé API.';
            msgEl.className = 'key-settings-msg error';
            msgEl.style.display = 'block';
            return;
        }
        currentConfig.apiKey = key;
        msgEl.textContent = 'Clé API enregistrée avec succès.';
        msgEl.className = 'key-settings-msg success';
        msgEl.style.display = 'block';
    });

    clearBtn.addEventListener('click', () => {
        currentConfig.apiKey = '';
        settingsInput.value = '';
        msgEl.textContent = 'Clé API supprimée. L\'application sera inaccessible jusqu\'à ce qu\'une nouvelle clé soit fournie.';
        msgEl.className = 'key-settings-msg error';
        msgEl.style.display = 'block';
    });
}

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

    const apiKey = getApiKey();
    if (!apiKey) {
        boardEl.innerHTML = '<div class="sys-msg" style="color: #ff5252;">Clé API manquante. Veuillez la configurer dans les réglages.</div>';
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
    if (!apiResponse) {
        throw new Error('Unexpected API response');
    }

    // API returns errors with HTTP 200 for business-level issues like no_solution
    if (apiResponse.error && apiResponse.error.id === 'no_solution') {
        return [];
    }

    if (!Array.isArray(apiResponse.journeys)) {
        throw new Error('Unexpected API response');
    }

    return apiResponse.journeys.map(journey => {
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

function displayJourneysBoard(departures, options = {}) {
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
            const apiKey = getApiKey();
            if (!apiKey) {
                box.style.display = 'none';
                return;
            }

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
    const manualRefreshBtn = document.getElementById('manual-refresh-btn');
    const quickFavBtn = document.getElementById('quick-fav-btn');

    manualRefreshBtn.addEventListener('click', () => {
        fetchSncbJourneys();
    });

    quickFavBtn.addEventListener('click', () => {
        const currentRouteId = `${currentConfig.from.id}-${currentConfig.to.id}`;
        const isFav = currentConfig.favorites.some(f => `${f.from.id}-${f.to.id}` === currentRouteId);

        if (isFav) {
            currentConfig.favorites = currentConfig.favorites.filter(f => `${f.from.id}-${f.to.id}` !== currentRouteId);
        } else {
            const newFav = { from: currentConfig.from, to: currentConfig.to, label: currentConfig.label };
            currentConfig.favorites = [...currentConfig.favorites, newFav];
        }
        updateQuickFavBadge();
        triggerStarAnimation();
    });
}

function triggerStarAnimation() {
    const btn = document.getElementById('quick-fav-btn');
    btn.classList.remove('animate-star');
    void btn.offsetWidth;
    btn.classList.add('animate-star');
    btn.addEventListener('animationend', () => {
        btn.classList.remove('animate-star');
    }, { once: true });
}

function updateQuickFavBadge() {
    const quickFavBtn = document.getElementById('quick-fav-btn');
    const iconPlaceholder = quickFavBtn.querySelector('.icon-placeholder');
    const currentRouteId = `${currentConfig.from.id}-${currentConfig.to.id}`;
    const isFav = currentConfig.favorites.some(f => `${f.from.id}-${f.to.id}` === currentRouteId);

    if (isFav) {
        quickFavBtn.classList.add('active');
        quickFavBtn.title = "Retirer ce trajet des favoris";
        quickFavBtn.setAttribute('aria-label', "Retirer ce trajet des favoris");
    } else {
        quickFavBtn.classList.remove('active');
        quickFavBtn.title = "Ajouter ce trajet aux favoris";
        quickFavBtn.setAttribute('aria-label', "Ajouter ce trajet aux favoris");
    }

    if (iconPlaceholder) {
        const size = parseInt(iconPlaceholder.dataset.size, 10) || 24;
        iconPlaceholder.innerHTML = iconStar({ size, className: '', filled: isFav });
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
    const target = document.getElementById(`view-${screenId}`);
    if (target) {
        target.classList.add('active');
    }
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
