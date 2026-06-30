import { iconBus, iconTrain, iconClock } from '../../icons/index.js';

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

        const modeIcon = isAutocar ? iconBus({ size: 12 }) : iconTrain({ size: 12 });
        const modeLabel = isAutocar ? 'Autocar' : 'Train';

        this.shadowRoot.innerHTML = `
            <style>
                .journey-card {
                    background-color: var(--card-color, #161822);
                    border-radius: 14px;
                    padding: 16px;
                    margin-bottom: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
                }

                .time-area {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .time {
                    font-size: 1.8rem;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                    line-height: 1;
                    color: var(--text-main, #ffffff);
                }

                .arrival-time {
                    font-size: 0.8rem;
                    color: var(--text-muted, #8a8f9f);
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .arrival-time svg {
                    flex-shrink: 0;
                }

                .duration-row {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.8rem;
                    color: var(--text-muted, #8a8f9f);
                    margin-top: 6px;
                }

                .duration-icon {
                    display: inline-flex;
                    align-items: center;
                }

                .details {
                    text-align: right;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    flex-shrink: 0;
                }

                .badge {
                    align-self: flex-end;
                    font-size: 0.7rem;
                    background: rgba(255, 255, 255, 0.08);
                    padding: 3px 6px;
                    border-radius: 5px;
                    color: var(--text-muted, #8a8f9f);
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    white-space: nowrap;
                }

                .status-delayed {
                    font-size: 0.8rem;
                    color: #ff5252;
                    font-weight: 600;
                }
            </style>
            <div class="journey-card">
                <div class="time-area">
                    <div class="time">${departureTime}</div>
                    <div class="arrival-time">→ ${arrivalTime}</div>
                    <div class="duration-row">
                        <span class="duration-icon">${iconClock({ size: 14 })}</span>
                        <span>${duration}</span>
                    </div>
                </div>
                <div class="details">
                    <span class="badge">${modeIcon} ${modeLabel} n° ${headsign}</span>
                    <span class="badge">Terminus: ${direction}</span>
                    ${isDelayed ? '<div class="status-delayed">Retardé</div>' : ''}
                </div>
            </div>
        `;
    }
}

if (!customElements.get('journey-card')) {
    customElements.define('journey-card', JourneyCard);
}