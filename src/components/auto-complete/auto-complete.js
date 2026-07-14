import htmlText from './auto-complete.html?raw';
import cssText from './auto-complete.css?inline';

class AutoComplete extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._items = [];
    }

    static get observedAttributes() {
        return ['placeholder'];
    }

    connectedCallback() {
        this._connected = true;
        this.render();
        this.bindEvents();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'placeholder' && this._connected) {
            const input = this.shadowRoot.getElementById('autocomplete-input');
            if (input) input.placeholder = newValue || '';
        }
    }

    render() {
        const placeholder = this.getAttribute('placeholder') || '';
        this.shadowRoot.innerHTML = `<style>${cssText}</style>${htmlText}`;

        const input = this.shadowRoot.getElementById('autocomplete-input');
        input.placeholder = placeholder;

        this.updateClearButton();
        this.renderItems();
    }

    bindEvents() {
        const input = this.shadowRoot.getElementById('autocomplete-input');
        const dropdown = this.shadowRoot.getElementById('suggestions-dropdown');

        input.addEventListener('input', () => {
            this.updateClearButton();
            this.dispatchEvent(new CustomEvent('query-changed', {
                detail: { value: input.value }
            }));
        });

        dropdown.addEventListener('click', (e) => {
            const item = e.target.closest('.suggestion-item');
            if (!item) return;
            this.dispatchEvent(new CustomEvent('item-selected', {
                detail: { id: item.dataset.id, label: item.dataset.label }
            }));
            dropdown.style.display = 'none';
        });

        this.addEventListener('clear', () => {
            input.value = '';
            this.items = [];
            this.updateClearButton();
            dropdown.style.display = 'none';
            input.focus();
        });

        const lightClearBtn = Array.from(this.children).find(
            (child) => child.tagName.toLowerCase() === 'clear-button'
        );
        if (lightClearBtn) {
            this.addEventListener('click', (e) => {
                if (e.target === lightClearBtn || lightClearBtn.contains(e.target)) {
                    input.value = '';
                    this.items = [];
                    this.updateClearButton();
                    dropdown.style.display = 'none';
                    input.focus();
                }
            });
        }

        document.addEventListener('click', (e) => {
            if (!this.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }

    updateClearButton() {
        const slot = this.shadowRoot.getElementById('clear-btn-slot');
        const clearBtn = slot.assignedElements()[0];
        if (clearBtn) {
            const hasContent = this.shadowRoot.getElementById('autocomplete-input').value.trim().length > 0;
            clearBtn.setAttribute('input-has-content', hasContent.toString());
        }
    }

    renderItems() {
        const dropdown = this.shadowRoot.getElementById('suggestions-dropdown');
        if (this.items.length === 0) {
            dropdown.style.display = 'none';
            return;
        }
        dropdown.innerHTML = this.items.map(p => `
            <div class="suggestion-item" data-id="${p.id}" data-label="${p.label}">
                ${p.label}
            </div>
        `).join('');
        dropdown.style.display = 'block';
    }

    set items(value) {
        this._items = value;
        this.renderItems();
    }

    get items() {
        return this._items || [];
    }
}

if (!customElements.get('auto-complete')) {
    customElements.define('auto-complete', AutoComplete);
}
