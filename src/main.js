import './style.css';
import './components/search-settings/search-settings.js';
import './components/favorites-manager/favorites-manager.js';
import { currentConfig } from './state.js';
import { API_BASE_URL, PAGE_COUNT } from './constants.js';

let refreshIntervalId = null;

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    updateRouteTitle(currentConfig.label);
    fetchJourneys();
    initGlobalStateListener();
});

function updateRouteTitle(label) {
    const el = document.getElementById('route-label');
    if (el) el.textContent = label;
}

// Construction de l'URL avec les règles SNCF documentées
function buildSncftUrl() {
    let url = `${API_BASE_URL}?from=${currentConfig.from.id}&to=${currentConfig.to.id}&count=${PAGE_COUNT}`;

    // Gestion des correspondances (Trajets indirects)
    if (currentConfig.indirectRoutesEnabled) {
        url += '&max_nb_transfers=2';
    } else {
        url += '&max_nb_transfers=0';
    }

    // Gestion des Autocars de substitution (Si décoché, on interdit le mode)
    if (!currentConfig.autocarRoutesEnabled) {
        url += '&forbidden_uris%5B%5D=physical_mode%3ACoach&forbidden_uris%5B%5D=physical_mode%3ABus';
    }

    return url;
}

// Requête API principale
async function fetchJourneys() {
    const container = document.getElementById('journeys-container');
    if (!container) return;

    try {
        const apiKey = import.meta.env.VITE_SNCF_API_KEY;
        if (!apiKey) throw new Error("Clé API VITE_SNCF_API_KEY manquante dans l'environnement.");

        const response = await fetch(buildSncftUrl(), {
            headers: { 'Authorization': apiKey }
        });

        if (!response.ok) throw new Error(`Erreur API: ${response.status}`);

        const data = await response.json();
        renderJourneys(parseJourneys(data));
    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="error-card">❌ Erreur lors de la récupération : ${error.message}</div>`;
    }
}

// Parser robuste gérant le multi-légendes (trajets indirects)
function parseJourneys(apiResponse) {
    const journeys = apiResponse.journeys || [];

    return journeys.map(journey => {
        const departureTime = journey.departure_date_time;
        const arrivalTime = journey.arrival_date_time;

        // Extraction de toutes les sections de transport public actif
        const transitSections = (journey.sections || []).filter(sec => sec.type === "public_transport");

        const firstLeg = transitSections[0] || {};
        const lastLeg = transitSections[transitSections.length - 1] || {};

        const displayInfo = firstLeg.display_informations || {};
        const isIndirect = (journey.nb_transfers || 0) > 0;

        // Détection du mode de transport principal (Train ou Autocar)
        const physicalMode = displayInfo.physical_mode?.toLowerCase() || '';
        const isBus = physicalMode.includes('bus') || physicalMode.includes('coach');

        return {
            departureTime,
            arrivalTime,
            direction: isIndirect
                ? `${lastLeg.display_informations?.direction || 'Terminus'} (${journey.nb_transfers} corresp.)`
                : (displayInfo.direction || "Inconnue"),
            num: displayInfo.headsign || displayInfo.code || "N/A",
            isIndirect,
            isBus,
            isDelayed: (firstLeg.base_departure_date_time && firstLeg.base_departure_date_time !== departureTime)
        };
    });
}

// Injection HTML propre des cartes de trains
function renderJourneys(parsedJourneys) {
    const container = document.getElementById('journeys-container');
    if (parsedJourneys.length === 0) {
        container.innerHTML = `<div class="no-results">Aucun trajet trouvé pour les critères sélectionnés.</div>`;
        return;
    }

    container.innerHTML = parsedJourneys.map(j => {
        const dep = formatSncfTime(j.departureTime);
        const arr = formatSncfTime(j.arrivalTime);

        return `
            <div class="journey-card ${j.isIndirect ? 'indirect-route' : ''} ${j.isBus ? 'bus-route' : ''}">
                <div class="time-block">
                    <span class="dep-time">${dep}</span>
                    <span class="arrow">➔</span>
                    <span class="arr-time">${arr}</span>
                </div>
                <div class="meta-block">
                    <span class="transport-icon">${j.isBus ? '🚌' : '🚄'}</span>
                    <span class="train-number">${j.isBus ? 'Autocar' : 'Train'} n°${j.num}</span>
                    <span class="direction">Dir: ${j.direction}</span>
                </div>
                ${j.isDelayed ? '<span class="delay-badge">Retardé</span>' : ''}
            </div>
        `;
    }).join('');
}

function formatSncfTime(stringTime) {
    if (!stringTime) return '--:--';
    // Format SNCF : YYYYMMDDTHHMMSS -> HH:MM
    const timePart = stringTime.split('T')[1];
    return `${timePart.substring(0, 2)}:${timePart.substring(2, 4)}`;
}

// Écouteur réactif centralisé pour relancer les requêtes et les timers
function initGlobalStateListener() {
    window.addEventListener('app-state-changed', (e) => {
        const { property, value } = e.detail;

        // 1. Rechargement data si les filtres ou trajets changent
        const dataTriggers = ['from', 'to', 'autocarRoutesEnabled', 'indirectRoutesEnabled'];
        if (dataTriggers.includes(property)) {
            fetchJourneys();
        }

        // 2. Mise à jour de l'en-tête si le trajet change
        if (property === 'label') {
            updateRouteTitle(value);
        }

        // 3. Gestion du commutateur Auto-Refresh
        if (property === 'autoRefreshEnabled') {
            if (value) {
                if (refreshIntervalId) clearInterval(refreshIntervalId);
                refreshIntervalId = setInterval(() => {
                    console.log('🔄 Rafraîchissement automatique des horaires...');
                    fetchJourneys();
                }, 60000); // 60 secondes
            } else {
                clearInterval(refreshIntervalId);
                refreshIntervalId = null;
            }
        }
    });
}