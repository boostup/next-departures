import { currentConfig } from '../../state.js';
import htmlText from './search-settings.html?raw';
import cssText from './search-settings.css?inline';
import { iconBus } from '../../icons/index.js';

class SearchSettings extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `<style>${cssText}</style>${htmlText}`;
    }

    connectedCallback() {
        this.autoToggle = this.shadowRoot.getElementById('auto-toggle');
        this.autocarToggle = this.shadowRoot.getElementById('autocar-toggle');
        this.indirectToggle = this.shadowRoot.getElementById('indirect-toggle');

        this.injectIcons();
        this.syncState();
        this.bindEvents();

        this.stateListener = () => this.syncState();
        window.addEventListener('app-state-changed', this.stateListener);
    }

    disconnectedCallback() {
        window.removeEventListener('app-state-changed', this.stateListener);
    }

    injectIcons() {
        const iconMap = {
            bus: iconBus
        };

        this.shadowRoot.querySelectorAll('.icon-placeholder').forEach(el => {
            const iconFn = iconMap[el.dataset.icon];
            const size = parseInt(el.dataset.size, 10) || 20;
            if (iconFn) {
                el.innerHTML = iconFn({ size });
            }
        });
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

if (!customElements.get('search-settings')) {
    customElements.define('search-settings', SearchSettings);
}
