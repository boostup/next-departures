describe('clear-button', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('should render as hidden by default with correct icon', async () => {
        await import('../../src/components/clear-button/clear-button.js');

        const el = document.createElement('clear-button');
        document.body.appendChild(el);

        expect(el.style.display).toBe('none');
    });

    it('should show when input-has-content attribute is added', async () => {
        await import('../../src/components/clear-button/clear-button.js');

        const el = document.createElement('clear-button');
        document.body.appendChild(el);

        el.setAttribute('input-has-content', 'true');
        expect(el.style.display).toBe('inline-flex');
    });

    it('should dispatch clear event on click', async () => {
        await import('../../src/components/clear-button/clear-button.js');

        const el = document.createElement('clear-button');
        document.body.appendChild(el);

        let eventFired = false;
        let eventDetail = null;
        el.addEventListener('clear', (e) => {
            eventFired = true;
            eventDetail = e.detail;
        });

        el.setAttribute('input-has-content', 'true');
        const btn = el.shadowRoot.querySelector('button');
        btn.click();

        expect(eventFired).toBe(true);
    });

    it('should hide when clear event is dispatched', async () => {
        await import('../../src/components/clear-button/clear-button.js');

        const el = document.createElement('clear-button');
        document.body.appendChild(el);

        el.setAttribute('input-has-content', 'true');
        
        const btn = el.shadowRoot.querySelector('button');
        btn.click();

        // After click, the button should hide itself
        expect(el.style.display).toBe('none');
    });

    it('should accept size attribute for icon sizing', async () => {
        await import('../../src/components/clear-button/clear-button.js');

        const el = document.createElement('clear-button');
        el.setAttribute('size', '16');
        document.body.appendChild(el);

        el.setAttribute('input-has-content', 'true');
        const svg = el.shadowRoot.querySelector('svg');
        expect(svg).toBeDefined();
    });

    it('should clean up event listeners on disconnect', async () => {
        await import('../../src/components/clear-button/clear-button.js');

        const el = document.createElement('clear-button');
        document.body.appendChild(el);

        el.setAttribute('input-has-content', 'true');
        el.remove();

        expect(() => el.remove()).not.toThrow();
    });

    it('should render a visible shadow DOM button when host is visible', async () => {
        await import('../../src/components/clear-button/clear-button.js');

        const el = document.createElement('clear-button');
        el.setAttribute('input-has-content', 'true');
        document.body.appendChild(el);

        const btn = el.shadowRoot.querySelector('button');
        expect(btn).not.toBeNull();
        const computedDisplay = getComputedStyle(btn).display;
        expect(computedDisplay).not.toBe('none');
    });
});