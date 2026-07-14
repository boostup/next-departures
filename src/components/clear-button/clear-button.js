import { iconX } from '../../icons/index.js';
import htmlText from './clear-button.html?raw';
import cssText from './clear-button.css?inline';

class ClearButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.size = parseInt(this.getAttribute('size'), 10) || 16;
    }

    connectedCallback() {
        this.render();
        this.bindEvents();
        this._connected = true;
        this.updateVisibility();
    }

    static get observedAttributes() {
        return ['input-has-content', 'size'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'size' && this._connected) {
            this.renderIcon();
        } else if (this._connected) {
            this.updateVisibility();
        }
    }

    render() {
        this.shadowRoot.innerHTML = `<style>${cssText}</style>${htmlText}`;
        this.renderIcon();
        this.bindEvents();
    }

    renderIcon() {
        const btn = this.shadowRoot.querySelector('button');
        btn.innerHTML = iconX({ size: this.size });
    }

    bindEvents() {
        const btn = this.shadowRoot.querySelector('button');
        btn.addEventListener('click', () => {
            this.setAttribute('input-has-content', 'false');
            this.updateVisibility();
            this.dispatchEvent(new CustomEvent('clear', { bubbles: true, composed: true }));
        });
    }

    updateVisibility() {
        const hasContent = this.getAttribute('input-has-content') === 'true';
        this.style.display = hasContent ? 'inline-flex' : 'none';
    }
}

if (!customElements.get('clear-button')) {
    customElements.define('clear-button', ClearButton);
}