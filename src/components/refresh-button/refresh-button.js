import { iconRefresh } from '../../icons/index.js';
import htmlText from './refresh-button.html?raw';
import cssText from './refresh-button.css?inline';

class RefreshButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.bindEvents();
    }

    render() {
        this.shadowRoot.innerHTML = `<style>${cssText}</style>${htmlText}`;
        const iconPlaceholder = this.shadowRoot.querySelector('.icon-placeholder');
        const size = parseInt(iconPlaceholder.dataset.size, 10) || 18;
        iconPlaceholder.innerHTML = iconRefresh({ size, className: '' });
    }

    bindEvents() {
        const btn = this.shadowRoot.querySelector('.refresh-btn');
        btn.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('refresh'));
        });
    }
}

if (!customElements.get('refresh-button')) {
    customElements.define('refresh-button', RefreshButton);
}
