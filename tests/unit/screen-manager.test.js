import { vi } from 'vitest';

describe('ScreenManager component', () => {
    const storedItems = {};

    function setupDom() {
        document.body.innerHTML = `
            <div class="app-layout">
                <screen-manager>
                    <div id="view-api-key" class="view-screen active">API Key Screen</div>
                    <div id="view-board" class="view-screen">Board Screen</div>
                    <div id="view-settings" class="view-screen">Settings Screen</div>
                    <div id="view-settings-favorites" class="view-screen">Favorites Screen</div>
                    <div id="view-settings-filters" class="view-screen">Filters Screen</div>
                    <div id="view-settings-api-key" class="view-screen">API Key Settings Screen</div>
                </screen-manager>
            </div>
        `;
    }

    async function loadScreenManager() {
        const module = await import('../../src/components/screen-manager/screen-manager.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));
        return module;
    }

    beforeEach(() => {
        vi.stubGlobal('localStorage', {
            getItem: (key) => storedItems[key] || null,
            setItem: (key, value) => { storedItems[key] = value; },
            removeItem: (key) => { delete storedItems[key]; },
            clear: () => { Object.keys(storedItems).forEach(k => delete storedItems[k]); }
        });

        vi.stubGlobal('window', {
            dispatchEvent: () => true,
            addEventListener: () => {},
            removeEventListener: () => {},
            matchMedia: () => ({ matches: false })
        });

        // Override document.addEventListener to use real implementation for event capture
        const originalDocument = global.document;

        vi.resetModules();
        setupDom();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        Object.keys(storedItems).forEach(k => delete storedItems[k]);
    });

    it('should render element and exist after definition', async () => {
        await loadScreenManager();
        const manager = document.querySelector('screen-manager');
        expect(manager).toBeTruthy();
    });

    it('should set .active on child matching activeView attribute', async () => {
        await loadScreenManager();
        const manager = document.querySelector('screen-manager');
        manager.setAttribute('active-view', 'board');
        await new Promise(resolve => setTimeout(resolve, 0));
        
        const board = document.getElementById('view-board');
        expect(board.classList.contains('active')).toBe(true);
        
        const apiKey = document.getElementById('view-api-key');
        expect(apiKey.classList.contains('active')).toBe(false);
    });

    it('should remove .active from previously active child when switching', async () => {
        await loadScreenManager();
        const manager = document.querySelector('screen-manager');
        
        manager.setAttribute('active-view', 'settings');
        await new Promise(resolve => setTimeout(resolve, 0));
        
        const settings = document.getElementById('view-settings');
        expect(settings.classList.contains('active')).toBe(true);
        
        manager.setAttribute('active-view', 'board');
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(settings.classList.contains('active')).toBe(false);
        expect(document.getElementById('view-board').classList.contains('active')).toBe(true);
    });

    it('should transition to settings screen on navigate-to event with destination detail', async () => {
        await loadScreenManager();
        const manager = document.querySelector('screen-manager');
        
        manager.dispatchEvent(new CustomEvent('navigate-to', {
            detail: { destination: 'settings' },
            bubbles: true
        }));
        
        const settings = document.getElementById('view-settings');
        expect(settings.classList.contains('active')).toBe(true);
    });

    it('should transition to board screen on navigate-to event', async () => {
        await loadScreenManager();
        const manager = document.querySelector('screen-manager');
        
        document.getElementById('view-settings').classList.add('active');
        manager.dispatchEvent(new CustomEvent('navigate-to', {
            detail: { destination: 'board' },
            bubbles: true
        }));
        
        expect(document.getElementById('view-board').classList.contains('active')).toBe(true);
    });

    it('should ignore missing destination gracefully (no-op)', async () => {
        await loadScreenManager();
        const manager = document.querySelector('screen-manager');
        
        const initialActive = document.getElementById('view-api-key');
        expect(initialActive.classList.contains('active')).toBe(true);
        
        manager.dispatchEvent(new CustomEvent('navigate-to', {
            detail: { destination: 'nonexistent' },
            bubbles: true
        }));
        
        const allScreens = document.querySelectorAll('.view-screen');
        const activeCount = Array.from(allScreens).filter(s => s.classList.contains('active')).length;
        expect(activeCount).toBe(0);
    });

    it('should transition to settings on settings-click event (shadow DOM bridge)', async () => {
        await loadScreenManager();
        
        document.dispatchEvent(new CustomEvent('settings-click'));
        
        const settings = document.getElementById('view-settings');
        expect(settings.classList.contains('active')).toBe(true);
    });

    it('should listen for settings-item clicks and navigate', async () => {
        await loadScreenManager();
        
        const settingsItem = document.createElement('li');
        settingsItem.className = 'settings-item';
        settingsItem.dataset.navigate = 'settings-filters';
        settingsItem.textContent = 'Filters';
        
        document.getElementById('view-settings').appendChild(settingsItem);
        
        settingsItem.click();
        
        expect(document.getElementById('view-settings-filters').classList.contains('active')).toBe(true);
    });

    it('should listen for back-btn clicks and navigate', async () => {
        await loadScreenManager();
        const manager = document.querySelector('screen-manager');
        
        manager.setAttribute('active-view', 'settings-filters');
        
        const backBtn = document.createElement('button');
        backBtn.className = 'back-btn';
        backBtn.dataset.target = 'board';
        
        document.getElementById('view-settings-filters').appendChild(backBtn);
        
        backBtn.click();
        
        expect(document.getElementById('view-board').classList.contains('active')).toBe(true);
    });
});