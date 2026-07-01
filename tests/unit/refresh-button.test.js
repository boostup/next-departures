describe('refresh-button', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('should render a button with refresh icon and label', async () => {
        await import('../../src/components/refresh-button/refresh-button.js');

        const el = document.createElement('refresh-button');
        document.body.appendChild(el);

        const btn = el.shadowRoot.querySelector('.refresh-btn');
        expect(btn).not.toBeNull();
        expect(btn.textContent).toContain('Actualiser');
    });

    it('should inject refresh icon into shadow DOM', async () => {
        await import('../../src/components/refresh-button/refresh-button.js');

        const el = document.createElement('refresh-button');
        document.body.appendChild(el);

        const svg = el.shadowRoot.querySelector('.icon-placeholder svg');
        expect(svg).not.toBeNull();
    });

    it('should dispatch refresh event on click', async () => {
        await import('../../src/components/refresh-button/refresh-button.js');

        const el = document.createElement('refresh-button');
        document.body.appendChild(el);

        let eventFired = false;
        el.addEventListener('refresh', () => {
            eventFired = true;
        });

        const btn = el.shadowRoot.querySelector('.refresh-btn');
        btn.click();

        expect(eventFired).toBe(true);
    });
});
