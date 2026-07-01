import { vi } from 'vitest';

describe('auto-complete', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        vi.stubGlobal('window', {
            dispatchEvent: () => true,
            addEventListener: () => {},
            removeEventListener: () => {}
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should render with a placeholder attribute', async () => {
        await import('../../src/components/auto-complete/auto-complete.js');

        const el = document.createElement('auto-complete');
        el.setAttribute('placeholder', 'Où allez-vous ?');
        document.body.appendChild(el);

        const input = el.shadowRoot.getElementById('autocomplete-input');
        expect(input.placeholder).toBe('Où allez-vous ?');
    });

    it('should render a dropdown container', async () => {
        await import('../../src/components/auto-complete/auto-complete.js');

        const el = document.createElement('auto-complete');
        document.body.appendChild(el);

        const dropdown = el.shadowRoot.getElementById('suggestions-dropdown');
        expect(dropdown).not.toBeNull();
    });

    it('should display items passed via items property', async () => {
        await import('../../src/components/auto-complete/auto-complete.js');

        const el = document.createElement('auto-complete');
        document.body.appendChild(el);

        el.items = [
            { id: 'stop_area:SNCF:123456', label: 'Paris Gare de Lyon' },
            { id: 'stop_area:SNCF:654321', label: 'Lyon Part-Dieu' }
        ];

        const dropdown = el.shadowRoot.getElementById('suggestions-dropdown');
        expect(dropdown.innerHTML).toContain('Paris Gare de Lyon');
        expect(dropdown.innerHTML).toContain('Lyon Part-Dieu');
    });

    it('should dispatch item-selected event with id and label on item click', async () => {
        await import('../../src/components/auto-complete/auto-complete.js');

        const el = document.createElement('auto-complete');
        document.body.appendChild(el);

        el.items = [
            { id: 'stop_area:SNCF:123456', label: 'Paris Gare de Lyon' }
        ];

        const detailReceived = [];
        el.addEventListener('item-selected', (e) => {
            detailReceived.push(e.detail);
        });

        const itemEl = el.shadowRoot.querySelector('.suggestion-item');
        itemEl.click();

        expect(detailReceived.length).toBe(1);
        expect(detailReceived[0].id).toBe('stop_area:SNCF:123456');
        expect(detailReceived[0].label).toBe('Paris Gare de Lyon');
    });

    it('should hide dropdown when clear event is dispatched', async () => {
        await import('../../src/components/auto-complete/auto-complete.js');

        const el = document.createElement('auto-complete');
        document.body.appendChild(el);

        el.items = [
            { id: 'stop_area:SNCF:123456', label: 'Paris Gare de Lyon' }
        ];

        const dropdown = el.shadowRoot.getElementById('suggestions-dropdown');
        dropdown.style.display = 'block';

        el.dispatchEvent(new CustomEvent('clear'));

        expect(dropdown.style.display).toBe('none');
    });

    it('should hide dropdown when clicking outside the component', async () => {
        await import('../../src/components/auto-complete/auto-complete.js');

        const el = document.createElement('auto-complete');
        document.body.appendChild(el);

        el.items = [
            { id: 'stop_area:SNCF:123456', label: 'Paris Gare de Lyon' }
        ];

        const dropdown = el.shadowRoot.getElementById('suggestions-dropdown');
        dropdown.style.display = 'block';

        const outsideEl = document.createElement('div');
        document.body.appendChild(outsideEl);
        outsideEl.click();

        expect(dropdown.style.display).toBe('none');
    });

    it('should clear input value when clear event is dispatched', async () => {
        await import('../../src/components/auto-complete/auto-complete.js');

        const el = document.createElement('auto-complete');
        document.body.appendChild(el);

        const input = el.shadowRoot.getElementById('autocomplete-input');
        input.value = 'Paris';

        el.dispatchEvent(new CustomEvent('clear'));

        expect(input.value).toBe('');
    });
});
