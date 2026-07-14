import { vi } from 'vitest';
import { currentConfig } from '../../src/state.js';

describe('header-actions', () => {
    beforeEach(() => {
        currentConfig.favorites = [];
        currentConfig.defaultRoute = null;
        currentConfig.label = 'St-Germain ➔ Vichy';
        currentConfig.from = { id: 'stop_area:SNCF:1', name: 'St-Germain' };
        currentConfig.to = { id: 'stop_area:SNCF:2', name: 'Vichy' };

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

    it('should render route display with origin and destination', async () => {
        await import('../../src/components/header-actions/header-actions.js');

        const el = document.createElement('header-actions');
        document.body.appendChild(el);

        expect(el.shadowRoot.getElementById('origin-station').textContent).toBe('St-Germain');
        expect(el.shadowRoot.getElementById('destination-station').textContent).toBe('Vichy');
    });

    it('should render settings and favorite buttons', async () => {
        await import('../../src/components/header-actions/header-actions.js');

        const el = document.createElement('header-actions');
        document.body.appendChild(el);

        expect(el.shadowRoot.getElementById('quick-fav-btn')).not.toBeNull();
        expect(el.shadowRoot.getElementById('go-settings-btn')).not.toBeNull();
    });

    it('should dispatch favorite-click event on favorite button click', async () => {
        await import('../../src/components/header-actions/header-actions.js');

        const el = document.createElement('header-actions');
        document.body.appendChild(el);

        let eventFired = false;
        el.addEventListener('favorite-click', () => {
            eventFired = true;
        });

        const favBtn = el.shadowRoot.getElementById('quick-fav-btn');
        favBtn.click();

        expect(eventFired).toBe(true);
    });

    it('should dispatch settings-click event on settings button click', async () => {
        await import('../../src/components/header-actions/header-actions.js');

        const el = document.createElement('header-actions');
        document.body.appendChild(el);

        let eventFired = false;
        el.addEventListener('settings-click', () => {
            eventFired = true;
        });

        const settingsBtn = el.shadowRoot.getElementById('go-settings-btn');
        settingsBtn.click();

        expect(eventFired).toBe(true);
    });

    it('should update favorite button state when favorites change', async () => {
        await import('../../src/components/header-actions/header-actions.js');

        const el = document.createElement('header-actions');
        document.body.appendChild(el);

        currentConfig.favorites = [
            { from: { id: 'stop_area:SNCF:1', name: 'St-Germain' }, to: { id: 'stop_area:SNCF:2', name: 'Vichy' }, label: 'St-Germain ➔ Vichy' }
        ];

        el.syncState();

        const favBtn = el.shadowRoot.getElementById('quick-fav-btn');
        expect(favBtn.classList.contains('active')).toBe(true);
    });

    it('should render cog icon in settings button', async () => {
        await import('../../src/components/header-actions/header-actions.js');

        const el = document.createElement('header-actions');
        document.body.appendChild(el);

        const settingsBtn = el.shadowRoot.getElementById('go-settings-btn');
        const iconPlaceholder = settingsBtn.querySelector('.icon-placeholder');
        const svg = iconPlaceholder.querySelector('svg');

        expect(svg).not.toBeNull();
    });
});
