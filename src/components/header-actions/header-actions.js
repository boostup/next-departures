import { currentConfig } from '../../state.js';
import { iconStar } from '../../icons/index.js';
import htmlText from './header-actions.html?raw';
import cssText from './header-actions.css?inline';

class HeaderActions extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.bindEvents();
        this.syncState();

        this.stateListener = () => this.syncState();
        window.addEventListener('app-state-changed', this.stateListener);
    }

    disconnectedCallback() {
        window.removeEventListener('app-state-changed', this.stateListener);
    }

    render() {
        this.shadowRoot.innerHTML = `<style>${cssText}</style>${htmlText}`;
        this.originEl = this.shadowRoot.getElementById('origin-station');
        this.destinationEl = this.shadowRoot.getElementById('destination-station');
        this.favBtn = this.shadowRoot.getElementById('quick-fav-btn');
        this.favIcon = this.favBtn.querySelector('.icon-placeholder');
        this.settingsBtn = this.shadowRoot.getElementById('go-settings-btn');
    }

    bindEvents() {
        this.favBtn.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('favorite-click'));
        });

        this.settingsBtn.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('settings-click'));
        });
    }

    syncState() {
        const parts = (currentConfig.label || '').split(' ➔ ');
        this.originEl.textContent = parts[0] || '';
        this.destinationEl.textContent = parts[1] || '';

        const currentRouteId = `${currentConfig.from.id}-${currentConfig.to.id}`;
        const isFav = currentConfig.favorites.some(f => `${f.from.id}-${f.to.id}` === currentRouteId);

        if (isFav) {
            this.favBtn.classList.add('active');
            this.favBtn.title = "Retirer ce trajet des favoris";
            this.favBtn.setAttribute('aria-label', "Retirer ce trajet des favoris");
        } else {
            this.favBtn.classList.remove('active');
            this.favBtn.title = "Ajouter ce trajet aux favoris";
            this.favBtn.setAttribute('aria-label', "Ajouter ce trajet aux favoris");
        }

        const size = parseInt(this.favIcon.dataset.size, 10) || 24;
        this.favIcon.innerHTML = iconStar({ size, className: '', filled: isFav });
    }
}

if (!customElements.get('header-actions')) {
    customElements.define('header-actions', HeaderActions);
}
