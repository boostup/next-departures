import { currentConfig } from '../../state.js';
import htmlText from './favorites-manager.html?raw';
import cssText from './favorites-manager.css?inline';
import { iconCrown, iconX } from '../../icons/index.js';

class FavoritesManager extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `<style>${cssText}</style>${htmlText}`;
        this.container = this.shadowRoot.getElementById('container');
    }

    connectedCallback() {
        this.renderList();
        this.bindEvents();

        this.stateListener = (e) => {
            if (e.detail.property === 'favorites' || e.detail.property === 'defaultRoute') {
                this.renderList();
            }
        };
        window.addEventListener('app-state-changed', this.stateListener);
    }

    disconnectedCallback() {
        window.removeEventListener('app-state-changed', this.stateListener);
    }

    renderList() {
        const favs = currentConfig.favorites;
        const def = currentConfig.defaultRoute;

        if (favs.length === 0) {
            this.container.innerHTML = `<div class="empty-label">Aucun trajet enregistré. Ajoutez-en un depuis l'écran principal.</div>`;
            return;
        }

        this.container.innerHTML = favs.map((route, i) => {
            const isDefault = def && def.from.id === route.from.id && def.to.id === route.to.id;
            const pinIcon = iconCrown({ size: 16 });
            const pinLabel = isDefault ? 'Trajet par défaut' : 'Définir comme trajet par défaut';
            return `
                <div class="fav-item">
                    <button class="fav-title" data-action="load" data-index="${i}">
                        ${route.label}
                    </button>
                    <div class="actions">
                        <button class="btn btn-pin ${isDefault ? 'active' : ''}" data-action="pin" data-index="${i}" aria-label="${pinLabel}">
                            ${pinIcon}
                        </button>
                        <button class="btn btn-delete" data-action="delete" data-index="${i}" aria-label="Supprimer ce trajet">${iconX({ size: 16 })}</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    bindEvents() {
        this.container.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const index = parseInt(button.dataset.index, 10);
            const action = button.dataset.action;
            const targetRoute = currentConfig.favorites[index];

            if (!targetRoute) return;

            if (action === 'load') {
                currentConfig.from = targetRoute.from;
                currentConfig.to = targetRoute.to;
                document.getElementById('dest-input').value = targetRoute.to.name;
                document.getElementById('view-settings-favorites').classList.remove('active');
                document.getElementById('view-board').classList.add('active');
            } else if (action === 'pin') {
                currentConfig.defaultRoute = targetRoute;
            } else if (action === 'delete') {
                const def = currentConfig.defaultRoute;
                if (def && def.from.id === targetRoute.from.id && def.to.id === targetRoute.to.id) {
                    currentConfig.defaultRoute = null;
                }
                currentConfig.favorites = currentConfig.favorites.filter((_, i) => i !== index);
            }
        });
    }
}

customElements.define('favorites-manager', FavoritesManager);