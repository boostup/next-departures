import htmlText from './search-settings.html?raw';
import cssText from './search-settings.css?inline';
import { currentConfig } from '../../state.js';

class SearchSettings extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadow.innerHTML = `<style>${cssText}</style>${htmlText}`;

        this.container = this.shadow.querySelector('.container');
        this.btnToggle = this.shadow.querySelector('.toggle-panel-btn');
        this.inputAuto = this.shadow.querySelector('.js-auto');
        this.inputAutocars = this.shadow.querySelector('.js-autocars');
        this.inputIndirect = this.shadow.querySelector('.js-indirect');

        this.syncInputs();
        this.initEvents();
    }

    syncInputs() {
        this.inputAuto.checked = currentConfig.autoRefreshEnabled;
        this.inputAutocars.checked = currentConfig.autocarRoutesEnabled;
        this.inputIndirect.checked = currentConfig.indirectRoutesEnabled;
    }

    initEvents() {
        this.btnToggle.addEventListener('click', () => {
            this.container.classList.toggle('is-open');
        });

        this.inputAuto.addEventListener('change', (e) => {
            currentConfig.autoRefreshEnabled = e.target.checked;
        });

        this.inputAutocars.addEventListener('change', (e) => {
            currentConfig.autocarRoutesEnabled = e.target.checked;
        });

        this.inputIndirect.addEventListener('change', (e) => {
            currentConfig.indirectRoutesEnabled = e.target.checked;
        });
    }
}

customElements.define('search-settings', SearchSettings);