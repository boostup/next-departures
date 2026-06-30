describe('favorites-manager', () => {
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

    it('should render empty state when currentConfig.favorites is empty', async () => {
        const { currentConfig } = await import('../../src/state.js');
        await import('../../src/components/favorites-manager/favorites-manager.js');

        const el = document.createElement('favorites-manager');
        document.body.appendChild(el);

        const container = el.shadowRoot.getElementById('container');
        expect(container.textContent).toContain('Aucun trajet enregistré');
    });

    it('should render list with correct labels and data-index', async () => {
        const { currentConfig } = await import('../../src/state.js');

        currentConfig.favorites = [
            { from: { id: 'f1', name: 'From Station' }, to: { id: 't1', name: 'To Station' }, label: 'From Station ➔ To Station' }
        ];
        currentConfig.defaultRoute = null;

        await import('../../src/components/favorites-manager/favorites-manager.js');

        const el = document.createElement('favorites-manager');
        document.body.appendChild(el);

        const container = el.shadowRoot.getElementById('container');
        const titleBtn = container.querySelector('.fav-title');
        expect(titleBtn).toBeDefined();
        expect(titleBtn.textContent).toContain('From Station');
        expect(titleBtn.dataset.index).toBe('0');
    });

    it('should render default-route crown icon as active when route is default', async () => {
        const { currentConfig } = await import('../../src/state.js');

        currentConfig.favorites = [
            { from: { id: 'f1', name: 'From Station' }, to: { id: 't1', name: 'To Station' }, label: 'From Station ➔ To Station' }
        ];
        currentConfig.defaultRoute = { from: { id: 'f1', name: 'From Station' }, to: { id: 't1', name: 'To Station' }, label: 'From Station ➔ To Station' };

        await import('../../src/components/favorites-manager/favorites-manager.js');

        const el = document.createElement('favorites-manager');
        document.body.appendChild(el);

        const pinBtn = el.shadowRoot.querySelector('.btn-pin');
        expect(pinBtn.classList.contains('active')).toBe(true);
    });

    it('should set currentConfig.defaultRoute when pin button clicked', async () => {
        const { currentConfig } = await import('../../src/state.js');

        currentConfig.favorites = [
            { from: { id: 'f1', name: 'From Station' }, to: { id: 't1', name: 'To Station' }, label: 'From ➔ To' }
        ];
        currentConfig.defaultRoute = null;

        await import('../../src/components/favorites-manager/favorites-manager.js');

        const el = document.createElement('favorites-manager');
        document.body.appendChild(el);

        const pinBtn = el.shadowRoot.querySelector('.btn-pin');
        pinBtn.click();

        expect(currentConfig.defaultRoute.from.id).toBe('f1');
    });

    it('should remove route from favorites when delete button clicked', async () => {
        const { currentConfig } = await import('../../src/state.js');

        currentConfig.favorites = [
            { from: { id: 'f1', name: 'From Station' }, to: { id: 't1', name: 'To Station' }, label: 'From ➔ To' }
        ];
        currentConfig.defaultRoute = null;

        await import('../../src/components/favorites-manager/favorites-manager.js');

        const el = document.createElement('favorites-manager');
        document.body.appendChild(el);

        const deleteBtn = el.shadowRoot.querySelector('.btn-delete');
        deleteBtn.click();

        expect(currentConfig.favorites.length).toBe(0);
    });

    it('should clear defaultRoute when deleting the default route', async () => {
        const { currentConfig } = await import('../../src/state.js');

        currentConfig.favorites = [
            { from: { id: 'f1', name: 'From Station' }, to: { id: 't1', name: 'To Station' }, label: 'From ➔ To' }
        ];
        currentConfig.defaultRoute = { from: { id: 'f1', name: 'From Station' }, to: { id: 't1', name: 'To Station' }, label: 'From ➔ To' };

        await import('../../src/components/favorites-manager/favorites-manager.js');

        const el = document.createElement('favorites-manager');
        document.body.appendChild(el);

        const deleteBtn = el.shadowRoot.querySelector('.btn-delete');
        deleteBtn.click();

        expect(currentConfig.defaultRoute).toBe(null);
    });

    it('should render crown icon in shadow DOM', async () => {
        const { currentConfig } = await import('../../src/state.js');

        currentConfig.favorites = [
            { from: { id: 'f1', name: 'From Station' }, to: { id: 't1', name: 'To Station' }, label: 'From ➔ To' }
        ];
        currentConfig.defaultRoute = null;

        await import('../../src/components/favorites-manager/favorites-manager.js');

        const el = document.createElement('favorites-manager');
        document.body.appendChild(el);

        const crownSvg = el.shadowRoot.querySelector('.btn-pin svg');
        expect(crownSvg).toBeDefined();
    });
});