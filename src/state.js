import { ST_GERMAIN, VICHY } from './constants.js';

const savedFavorites = JSON.parse(localStorage.getItem('sncf_favorites')) || [];
const savedDefaultRoute = JSON.parse(localStorage.getItem('sncf_default_route')) || null;

export const currentConfig = new Proxy({
    from: savedDefaultRoute?.from || { id: ST_GERMAIN, name: 'St-Germain-des-Fossés' },
    to: savedDefaultRoute?.to || { id: VICHY, name: 'Vichy' },
    label: savedDefaultRoute?.label || 'St-Germain ➔ Vichy',
    autoRefreshEnabled: false,
    autocarRoutesEnabled: false,
    indirectRoutesEnabled: false,
    favorites: savedFavorites,
    defaultRoute: savedDefaultRoute
}, {
    set(target, property, value) {
        if (target[property] === value) return true;

        target[property] = value;

        // Persistance locale immédiate pour les favoris et défauts
        if (property === 'favorites') {
            localStorage.setItem('sncf_favorites', JSON.stringify(value));
        }
        if (property === 'defaultRoute') {
            if (value) localStorage.setItem('sncf_default_route', JSON.stringify(value));
            else localStorage.removeItem('sncf_default_route');
        }

        // Notification globale : le cœur du système réactif
        window.dispatchEvent(new CustomEvent('app-state-changed', {
            detail: { property, value, state: { ...target } }
        }));

        return true;
    }
});