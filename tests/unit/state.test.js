describe('currentConfig Proxy', () => {
    beforeEach(() => {
        vi.stubGlobal('localStorage', {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
            clear: () => {}
        });

        vi.stubGlobal('window', {
            dispatchEvent: () => true
        });

        vi.resetModules();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should have default from/to matching DEFAULT_STATIONS when localStorage is empty', () => {
        const { currentConfig } = require('../../src/state.js');
        expect(currentConfig.from.name).toBe('St-Germain-des-Fossés');
        expect(currentConfig.to.name).toBe('Vichy');
    });

    it('should auto-generate label when setting from/to', () => {
        const { currentConfig } = require('../../src/state.js');
        expect(currentConfig.label).toBe('St-Germain-des-Fossés ➔ Vichy');

        currentConfig.from = { id: 'test-id', name: 'Test Station' };
        expect(currentConfig.label).toBe('Test Station ➔ Vichy');
    });
});

describe('currentConfig localStorage persistence', () => {
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
            dispatchEvent: () => true
        });

        vi.resetModules();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should persist favorites to localStorage', () => {
        const { currentConfig } = require('../../src/state.js');
        const newFav = { from: { id: 'f1', name: 'From' }, to: { id: 't1', name: 'To' }, label: 'From ➔ To' };
        currentConfig.favorites = [newFav];

        expect(storedItems['sncf_fav_routes']).toBe(JSON.stringify([newFav]));
    });

    it('should persist defaultRoute to localStorage', () => {
        const { currentConfig } = require('../../src/state.js');
        const route = { from: { id: 'f1', name: 'From' }, to: { id: 't1', name: 'To' }, label: 'From ➔ To' };
        currentConfig.defaultRoute = route;

        expect(storedItems['sncf_def_route']).toBe(JSON.stringify(route));
    });

    it('should persist autoEnabled to localStorage', () => {
        const { currentConfig } = require('../../src/state.js');
        currentConfig.autoEnabled = true;

        expect(storedItems['sncf_auto_init']).toBe('true');
    });

    it('should persist apiKey to localStorage', () => {
        const { currentConfig } = require('../../src/state.js');
        currentConfig.apiKey = 'test-api-key';

        expect(storedItems['sncf_api_key']).toBe('test-api-key');
    });
});

describe('currentConfig event dispatching', () => {
    let dispatchedEvents;

    beforeEach(() => {
        dispatchedEvents = [];

        vi.stubGlobal('localStorage', {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
            clear: () => {}
        });

        vi.stubGlobal('window', {
            dispatchEvent: (event) => {
                dispatchedEvents.push({ property: event.detail.property, value: event.detail.value });
                return true;
            }
        });

        vi.resetModules();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should dispatch app-state-changed event with label when setting from/to', () => {
        const { currentConfig } = require('../../src/state.js');
        dispatchedEvents.length = 0;
        currentConfig.from = { id: 'new-id', name: 'New Station' };

        const labelEvents = dispatchedEvents.filter(e => e.property === 'label');
        expect(labelEvents.length).toBe(1);
        expect(labelEvents[0].value).toBe('New Station ➔ Vichy');
    });
});

describe('currentConfig null defaultRoute', () => {
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
            dispatchEvent: () => true
        });

        vi.resetModules();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should remove localStorage key when setting defaultRoute to null', () => {
        const { currentConfig } = require('../../src/state.js');
        currentConfig.defaultRoute = { from: { id: 'f1' }, to: { id: 't1' }, label: 'R' };

        expect(storedItems['sncf_def_route']).toBeDefined();
        expect(storedItems['sncf_def_route']).toBe(JSON.stringify({ from: { id: 'f1' }, to: { id: 't1' }, label: 'R' }));

        currentConfig.defaultRoute = null;

        expect(storedItems['sncf_def_route']).toBeUndefined();
    });
});