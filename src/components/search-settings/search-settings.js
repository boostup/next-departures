import { currentConfig } from '../../state.js';
import htmlText from './search-settings.html?raw';
import cssText from './search-settings.css?inline';

class SearchSettings extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        // Utilisation propre de Vite pour injecter le HTML/CSS isolés sans chaînes de texte complexes
        this.shadowRoot.innerHTML = `<style>${cssText}</style>${htmlText}`;
    }

    connectedCallback() {
        this.autoToggle = this.shadowRoot.getElementById('auto-toggle');
        this.autocarToggle = this.shadowRoot.getElementById('autocar-toggle');
        this.indirectToggle = this.shadowRoot.getElementById('indirect-toggle');

        this.syncState();
        this.bindEvents();

        this.stateListener = () => this.syncState();
        window.addEventListener('app-state-changed', this.stateListener);
    }

    disconnectedCallback() {
        window.removeEventListener('app-state-changed', this.stateListener);
    }

    syncState() {
        this.autoToggle.checked = currentConfig.autoEnabled;
        this.autocarToggle.checked = currentConfig.autocarRoutesEnabled;
        this.indirectToggle.checked = currentConfig.indirectRoutesEnabled;
    }

    bindEvents() {
        this.autoToggle.addEventListener('change', (e) => {
            currentConfig.autoEnabled = e.target.checked;
        });
        this.autocarToggle.addEventListener('change', (e) => {
            currentConfig.autocarRoutesEnabled = e.target.checked;
        });
        this.indirectToggle.addEventListener('change', (e) => {
            currentConfig.indirectRoutesEnabled = e.target.checked;
        });
    }
}

customElements.define('search-settings', SearchSettings);