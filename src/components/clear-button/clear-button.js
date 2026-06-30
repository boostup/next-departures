import { iconX } from '../../icons/index.js';

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
        if (this._connected) {
            this.updateVisibility();
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    padding: 0;
                    margin: 0;
                    background: none;
                    border: none;
                    color: var(--text-muted, #8a8f9f);
                    cursor: pointer;
                    border-radius: 8px;
                }
                button:hover {
                    background: rgba(255, 255, 255, 0.08);
                }
            </style>
            <button type="button" aria-label="Effacer">
                ${iconX({ size: this.size })}
            </button>
        `;
    }

    bindEvents() {
        const btn = this.shadowRoot.querySelector('button');
        btn.addEventListener('click', () => {
            this.setAttribute('input-has-content', 'false');
            this.updateVisibility();
            this.dispatchEvent(new CustomEvent('clear'));
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