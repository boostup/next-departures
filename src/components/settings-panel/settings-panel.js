import htmlText from './settings-panel.html?raw';
import cssText from './settings-panel.css?inline';
import { activateView } from '../../utils/view-navigation.js';

class SettingsPanel extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
        this.bindEvents();
    }

    render() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `<style>${cssText}</style>${htmlText}`;
    }

    bindEvents() {
        this.settingsClickHandler = () => {
            this.open();
        };

        this.favoritesNavigateHandler = (e) => {
            this.close();
        };

        this.clickHandler = (e) => {
            const settingsItem = e.target.closest('.settings-item');
            if (settingsItem) {
                const dest = settingsItem.dataset.navigate;
                if (dest) {
                    this.navigateTo(dest);
                }
            }

            const backBtn = e.target.closest('.back-btn');
            if (backBtn) {
                const target = backBtn.dataset.target;
                if (target) {
                    // If the target view lives inside the panel, navigate
                    // within the panel. Otherwise (e.g. "board") this is a
                    // request to exit the panel, so close it like a backdrop
                    // click would.
                    const internalView = this.querySelector(`#view-${target}`);
                    if (internalView) {
                        this.navigateTo(target);
                    } else {
                        this.close();
                    }
                }
            }
        };

        this.backdropClickHandler = () => {
            this.close();
        };

        document.addEventListener('settings-click', this.settingsClickHandler);
        window.addEventListener('favorites-navigate', this.favoritesNavigateHandler);
        this.addEventListener('click', this.clickHandler);
        this.shadowRoot.querySelector('.panel-backdrop').addEventListener('click', this.backdropClickHandler);
    }

    disconnectedCallback() {
        document.removeEventListener('settings-click', this.settingsClickHandler);
        window.removeEventListener('favorites-navigate', this.favoritesNavigateHandler);
        this.removeEventListener('click', this.clickHandler);
        const backdrop = this.shadowRoot.querySelector('.panel-backdrop');
        if (backdrop) {
            backdrop.removeEventListener('click', this.backdropClickHandler);
        }
    }

    open() {
        this.classList.add('active');
        this.navigateTo('settings');
    }

    close() {
        this.classList.remove('active');
    }

    navigateTo(screenId) {
        activateView(this, screenId);
    }
}

if (!customElements.get('settings-panel')) {
    customElements.define('settings-panel', SettingsPanel);
}
