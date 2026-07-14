import htmlText from './screen-manager.html?raw';
import cssText from './screen-manager.css?inline';
import { activateView } from '../../utils/view-navigation.js';

class ScreenManager extends HTMLElement {
    static get observedAttributes() {
        return ['active-view'];
    }

    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
        this.bindEvents();
        const activeView = this.getAttribute('active-view');
        if (activeView) {
            this.navigateTo(activeView);
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'active-view' && newValue && oldValue !== newValue) {
            this.navigateTo(newValue);
        }
    }

    render() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `<style>${cssText}</style>${htmlText}`;
    }

    bindEvents() {
        this.navigateHandler = (e) => {
            const { destination } = e.detail || {};
            if (destination) {
                this.navigateTo(destination);
            }
        };

        this.favoritesNavigateHandler = (e) => {
            const { destination } = e.detail || {};
            if (destination) {
                this.navigateTo(destination);
            }
        };

        this.addEventListener('navigate-to', this.navigateHandler);
        window.addEventListener('favorites-navigate', this.favoritesNavigateHandler);
    }

    disconnectedCallback() {
        this.removeEventListener('navigate-to', this.navigateHandler);
        window.removeEventListener('favorites-navigate', this.favoritesNavigateHandler);
    }

    navigateTo(screenId) {
        activateView(this, screenId);
    }
}

if (!customElements.get('screen-manager')) {
    customElements.define('screen-manager', ScreenManager);
}