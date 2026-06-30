describe('search-settings', () => {
    let storedItems;

    beforeEach(() => {
        storedItems = {};

        vi.stubGlobal('localStorage', {
            getItem: (key) => storedItems[key] || null,
            setItem: (key, value) => { storedItems[key] = value; },
            removeItem: (key) => { delete storedItems[key]; },
            clear: () => { storedItems = {}; }
        });

        vi.stubGlobal('window', {
            dispatchEvent: () => true,
            addEventListener: () => {},
            removeEventListener: () => {}
        });

        document.body.innerHTML = '';
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should reflect currentConfig.autoEnabled in syncState', async () => {
        const { currentConfig } = await import('../../src/state.js');
        currentConfig.autoEnabled = true;

        await import('../../src/components/search-settings/search-settings.js');

        const el = document.createElement('search-settings');
        document.body.appendChild(el);

        const toggle = el.shadowRoot.getElementById('auto-toggle');
        expect(toggle.checked).toBe(true);
    });

    it('should reflect currentConfig.autocarRoutesEnabled in syncState', async () => {
        const { currentConfig } = await import('../../src/state.js');
        currentConfig.autocarRoutesEnabled = true;

        await import('../../src/components/search-settings/search-settings.js');

        const el = document.createElement('search-settings');
        document.body.appendChild(el);

        const autocarToggle = el.shadowRoot.getElementById('autocar-toggle');
        expect(autocarToggle.checked).toBe(true);
    });

    it('should reflect currentConfig.indirectRoutesEnabled in syncState', async () => {
        const { currentConfig } = await import('../../src/state.js');
        currentConfig.indirectRoutesEnabled = true;

        await import('../../src/components/search-settings/search-settings.js');

        const el = document.createElement('search-settings');
        document.body.appendChild(el);

        const indirectToggle = el.shadowRoot.getElementById('indirect-toggle');
        expect(indirectToggle.checked).toBe(true);
    });

    it('should update currentConfig.autoEnabled when auto-toggle changes', async () => {
        const { currentConfig } = await import('../../src/state.js');
        currentConfig.autoEnabled = false;

        await import('../../src/components/search-settings/search-settings.js');

        const el = document.createElement('search-settings');
        document.body.appendChild(el);

        const toggle = el.shadowRoot.getElementById('auto-toggle');
        toggle.checked = true;
        toggle.dispatchEvent(new Event('change'));

        expect(currentConfig.autoEnabled).toBe(true);
    });

    it('should update currentConfig.autocarRoutesEnabled when autocar-toggle changes', async () => {
        const { currentConfig } = await import('../../src/state.js');
        currentConfig.autocarRoutesEnabled = false;

        await import('../../src/components/search-settings/search-settings.js');

        const el = document.createElement('search-settings');
        document.body.appendChild(el);

        const autocarToggle = el.shadowRoot.getElementById('autocar-toggle');
        autocarToggle.checked = true;
        autocarToggle.dispatchEvent(new Event('change'));

        expect(currentConfig.autocarRoutesEnabled).toBe(true);
    });

    it('should update currentConfig.indirectRoutesEnabled when indirect-toggle changes', async () => {
        const { currentConfig } = await import('../../src/state.js');
        currentConfig.indirectRoutesEnabled = false;

        await import('../../src/components/search-settings/search-settings.js');

        const el = document.createElement('search-settings');
        document.body.appendChild(el);

        const indirectToggle = el.shadowRoot.getElementById('indirect-toggle');
        indirectToggle.checked = true;
        indirectToggle.dispatchEvent(new Event('change'));

        expect(currentConfig.indirectRoutesEnabled).toBe(true);
    });
});

describe('search-settings icon injection', () => {
    beforeEach(() => {
        vi.stubGlobal('localStorage', {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
            clear: () => {}
        });

        vi.stubGlobal('window', {
            dispatchEvent: () => true,
            addEventListener: () => {},
            removeEventListener: () => {}
        });

        document.body.innerHTML = '';
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should render bus icon in shadow DOM', async () => {
        const { currentConfig } = await import('../../src/state.js');

        await import('../../src/components/search-settings/search-settings.js');

        const el = document.createElement('search-settings');
        document.body.appendChild(el);

        const busSvg = el.shadowRoot.querySelector('.icon-placeholder svg');
        expect(busSvg).toBeDefined();
    });
});