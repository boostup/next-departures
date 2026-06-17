import htmlText from './favorites-manager.html?raw';
import cssText from './favorites-manager.css?inline';
import { currentConfig } from '../../state.js';

class FavoritesManager extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadow.innerHTML = `<style>${cssText}</style>${htmlText}`;
        this.listContainer = this.shadow.getElementById('favorites-list');
        this.btnSave = this.shadow.getElementById('btn-save-current');

        this.renderList();
        this.initEvents();

        // Réactivité locale : redessiner la liste si l'état des favoris ou par défaut change à distance
        window.addEventListener('app-state-changed', (e) => {
            if (e.detail.property === 'favorites' || e.detail.property === 'defaultRoute') {
                this.renderList();
            }
        });
    }

    renderList() {
        const favs = currentConfig.favorites;
        const def = currentConfig.defaultRoute;

        if (favs.length === 0) {
            this.listContainer.innerHTML = `<div class="no-fav">Aucun trajet enregistré dans vos favoris.</div>`;
            return;
        }

        this.listContainer.innerHTML = favs.map((route, index) => {
            const isDefault = def && def.from.id === route.from.id && def.to.id === route.to.id;

            return `
                <div class="favorite-item ${isDefault ? 'is-default' : ''}">
                    <button class="btn-load" data-index="${index}">
                        ${isDefault ? '👑' : '⭐'} ${route.label}
                    </button>
                    <div class="actions-group">
                        <button class="btn-action btn-pin" data-index="${index}" ${isDefault ? 'disabled' : ''} title="Définir par défaut">
                            📌
                        </button>
                        <button class="btn-action btn-delete" data-index="${index}" title="Supprimer">
                            ×
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    initEvents() {
        // Enregistrement du trajet actif
        this.btnSave.addEventListener('click', () => {
            const currentRouteId = `${currentConfig.from.id}-${currentConfig.to.id}`;
            const exists = currentConfig.favorites.some(f => `${f.from.id}-${f.to.id}` === currentRouteId);

            if (exists) return alert("Ce trajet fait déjà partie de vos favoris !");

            currentConfig.favorites = [
                ...currentConfig.favorites,
                { from: currentConfig.from, to: currentConfig.to, label: currentConfig.label }
            ];
        });

        // Délégation d'événements interne au Shadow DOM
        this.listContainer.addEventListener('click', (e) => {
            const loadBtn = e.target.closest('.btn-load');
            const pinBtn = e.target.closest('.btn-pin');
            const deleteBtn = e.target.closest('.btn-delete');
            const index = parseInt(loadBtn?.dataset.index || pinBtn?.dataset.index || deleteBtn?.dataset.index, 10);

            if (isNaN(index)) return;

            if (loadBtn) {
                const targetRoute = currentConfig.favorites[index];
                currentConfig.label = targetRoute.label;
                currentConfig.from = targetRoute.from;
                currentConfig.to = targetRoute.to;
            }

            if (pinBtn) {
                currentConfig.defaultRoute = { ...currentConfig.favorites[index] };
            }

            if (deleteBtn) {
                const routeToDelete = currentConfig.favorites[index];
                const def = currentConfig.defaultRoute;

                // Si on supprime la ligne par défaut courante, on réinitialise l'état par défaut
                if (def && def.from.id === routeToDelete.from.id && def.to.id === routeToDelete.to.id) {
                    currentConfig.defaultRoute = null;
                }
                currentConfig.favorites = currentConfig.favorites.filter((_, i) => i !== index);
            }
        });
    }
}

customElements.define('favorites-manager', FavoritesManager);