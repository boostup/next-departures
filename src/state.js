import { DEFAULT_STATIONS } from './constants.js';

const KEY_FAVORITES = 'sncf_fav_routes';
const KEY_DEFAULT_ROUTE = 'sncf_def_route';
const KEY_AUTO_ENABLED = 'sncf_auto_init';

const persistedFavs = JSON.parse(localStorage.getItem(KEY_FAVORITES)) || [];
const persistedDefault = JSON.parse(localStorage.getItem(KEY_DEFAULT_ROUTE)) || null;
const persistedAuto = localStorage.getItem(KEY_AUTO_ENABLED) === 'true';

export const currentConfig = new Proxy({
    from: persistedDefault?.from || DEFAULT_STATIONS.ST_GERMAIN,
    to: persistedDefault?.to || DEFAULT_STATIONS.VICHY,
    label: "",
    autoEnabled: persistedAuto,
    autocarRoutesEnabled: false,
    indirectRoutesEnabled: false,
    favorites: persistedFavs,
    defaultRoute: persistedDefault,
    theme: 'dark'
}, {
    set(target, property, value) {
        if (target[property] === value) return true;

        target[property] = value;

        // Génération automatique du label à chaque modification des gares
        if (property === 'from' || property === 'to') {
            target.label = `${target.from.name} ➔ ${target.to.name}`;
            window.dispatchEvent(new CustomEvent('app-state-changed', {
                detail: { property: 'label', value: target.label }
            }));
        }

        // Sauvegarde automatique locale
        if (property === 'favorites') {
            localStorage.setItem(KEY_FAVORITES, JSON.stringify(value));
        }
        if (property === 'defaultRoute') {
            if (value) {
                localStorage.setItem(KEY_DEFAULT_ROUTE, JSON.stringify(value));
            } else {
                localStorage.removeItem(KEY_DEFAULT_ROUTE);
            }
        }
        if (property === 'autoEnabled') {
            localStorage.setItem(KEY_AUTO_ENABLED, value ? 'true' : 'false');
        }

        // Publication de l'événement de mise à jour à destination des composants
        window.dispatchEvent(new CustomEvent('app-state-changed', {
            detail: { property, value, state: { ...target } }
        }));

        return true;
    }
});

// Calcul du label à l'allumage
currentConfig.label = `${currentConfig.from.name} ➔ ${currentConfig.to.name}`;