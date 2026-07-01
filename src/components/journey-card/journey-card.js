import { iconBus, iconTrain, iconClock } from '../../icons/index.js';
import htmlText from './journey-card.html?raw';
import cssText from './journey-card.css?inline';

class JourneyCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['departure-time', 'arrival-time', 'duration', 'headsign', 'direction', 'is-autocar', 'is-delayed'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        if (this.shadowRoot.innerHTML) {
            this.render();
        }
    }

    render() {
        const departureTime = this.getAttribute('departure-time') || '';
        const arrivalTime = this.getAttribute('arrival-time') || '';
        const duration = this.getAttribute('duration') || '';
        const headsign = this.getAttribute('headsign') || '';
        const direction = this.getAttribute('direction') || '';
        const isAutocar = this.getAttribute('is-autocar') === 'true';
        const isDelayed = this.getAttribute('is-delayed') === 'true';

        this.shadowRoot.innerHTML = `<style>${cssText}</style>${htmlText}`;

        this.shadowRoot.getElementById('departure-time').textContent = departureTime;

        const arrivalSpan = this.shadowRoot.querySelector('.arrival-value');
        arrivalSpan.textContent = arrivalTime;

        this.shadowRoot.getElementById('duration-value').textContent = duration;
        const durationIcon = this.shadowRoot.getElementById('duration-icon');
        durationIcon.innerHTML = iconClock({ size: 14 });

        const modeIcon = isAutocar ? iconBus({ size: 12 }) : iconTrain({ size: 12 });
        const modeLabel = isAutocar ? 'Autocar' : 'Train';
        const modeBadge = this.shadowRoot.getElementById('mode-badge');
        modeBadge.innerHTML = `${modeIcon} ${modeLabel} n° ${headsign}`;

        const terminusBadge = this.shadowRoot.getElementById('terminus-badge');
        terminusBadge.textContent = `Terminus: ${direction}`;

        this.renderDelayedStatus(isDelayed);
    }

    renderDelayedStatus(isDelayed) {
        const details = this.shadowRoot.querySelector('.details');
        let delayedEl = details.querySelector('.status-delayed');

        if (isDelayed) {
            if (!delayedEl) {
                delayedEl = document.createElement('div');
                delayedEl.className = 'status-delayed';
                delayedEl.textContent = 'Retardé';
                details.appendChild(delayedEl);
            } else {
                delayedEl.style.display = 'block';
            }
        } else {
            if (delayedEl) {
                delayedEl.remove();
            }
        }
    }
}

if (!customElements.get('journey-card')) {
    customElements.define('journey-card', JourneyCard);
}