describe('journey-card', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('should render with basic attributes', async () => {
        await import('../../src/components/journey-card/journey-card.js');

        const el = document.createElement('journey-card');
        el.setAttribute('departure-time', '14:30');
        el.setAttribute('arrival-time', '16:45');
        el.setAttribute('duration', '2h 15min');
        el.setAttribute('headsign', 'T123');
        el.setAttribute('direction', 'Paris');
        document.body.appendChild(el);

        const timeEl = el.shadowRoot.querySelector('.time');
        expect(timeEl.textContent).toBe('14:30');

        const arrivalEl = el.shadowRoot.querySelector('.arrival-time');
        expect(arrivalEl.textContent).toContain('16:45');

        const durationEl = el.shadowRoot.querySelector('.duration-row span:last-child');
        expect(durationEl.textContent).toBe('2h 15min');

        const headsignEl = el.shadowRoot.querySelector('.badge:first-child');
        expect(headsignEl.textContent).toContain('T123');
        expect(headsignEl.textContent).toContain('Train');
    });

    it('should display autocar icon and label when is-autocar is true', async () => {
        await import('../../src/components/journey-card/journey-card.js');

        const el = document.createElement('journey-card');
        el.setAttribute('departure-time', '08:00');
        el.setAttribute('arrival-time', '10:00');
        el.setAttribute('duration', '2h');
        el.setAttribute('headsign', 'B45');
        el.setAttribute('direction', 'Lyon');
        el.setAttribute('is-autocar', 'true');
        document.body.appendChild(el);

        const badge = el.shadowRoot.querySelector('.badge:first-child');
        expect(badge.textContent).toContain('Autocar');

        const busIcon = el.shadowRoot.querySelector('svg');
        expect(busIcon).toBeDefined();
    });

    it('should display delayed status when is-delayed is true', async () => {
        await import('../../src/components/journey-card/journey-card.js');

        const el = document.createElement('journey-card');
        el.setAttribute('departure-time', '09:00');
        el.setAttribute('arrival-time', '11:00');
        el.setAttribute('duration', '2h');
        el.setAttribute('headsign', 'T99');
        el.setAttribute('direction', 'Marseille');
        el.setAttribute('is-delayed', 'true');
        document.body.appendChild(el);

        const delayedEl = el.shadowRoot.querySelector('.status-delayed');
        expect(delayedEl).toBeDefined();
        expect(delayedEl.textContent).toContain('Retardé');
    });

    it('should not display delayed status when is-delayed is false', async () => {
        await import('../../src/components/journey-card/journey-card.js');

        const el = document.createElement('journey-card');
        el.setAttribute('departure-time', '09:00');
        el.setAttribute('arrival-time', '11:00');
        el.setAttribute('duration', '2h');
        el.setAttribute('headsign', 'T99');
        el.setAttribute('direction', 'Marseille');
        el.setAttribute('is-delayed', 'false');
        document.body.appendChild(el);

        const delayedEl = el.shadowRoot.querySelector('.status-delayed');
        expect(delayedEl).toBeNull();
    });

    it('should render accessible attributes', async () => {
        await import('../../src/components/journey-card/journey-card.js');

        const el = document.createElement('journey-card');
        el.setAttribute('departure-time', '10:00');
        el.setAttribute('arrival-time', '12:00');
        el.setAttribute('duration', '2h');
        el.setAttribute('headsign', 'T1');
        el.setAttribute('direction', 'Test');
        document.body.appendChild(el);

        const card = el.shadowRoot.querySelector('.journey-card');
        expect(card).toBeDefined();

        const modeBadge = el.shadowRoot.querySelector('#mode-badge');
        expect(modeBadge.textContent).toContain('T1');
    });
});