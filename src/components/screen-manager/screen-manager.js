import htmlText from './screen-manager.html?raw';
import cssText from './screen-manager.css?inline';

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

        this.settingsClickHandler = () => {
            this.navigateTo('settings');
        };

        this.addEventListener('navigate-to', this.navigateHandler);

        document.addEventListener('settings-click', this.settingsClickHandler);

        this.addEventListener('click', (e) => {
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
                    this.navigateTo(target);
                }
            }
        });
    }

    disconnectedCallback() {
        document.removeEventListener('settings-click', this.settingsClickHandler);
    }

    navigateTo(screenId) {
        const allScreens = document.querySelectorAll('.view-screen');
        allScreens.forEach(scr => {
            scr.classList.remove('active');
        });

        const target = document.getElementById(`view-${screenId}`);
        if (target) {
            target.classList.add('active');
        }
    }
}

if (!customElements.get('screen-manager')) {
    customElements.define('screen-manager', ScreenManager);
}