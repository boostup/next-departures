import { vi } from 'vitest';

describe('ScreenManager component', () => {
    const storedItems = {};

    function setupDom() {
        document.body.innerHTML = `
            <div class="app-layout">
                <screen-manager>
                    <div id="view-api-key" class="view-screen active">API Key Screen</div>
                    <div id="view-board" class="view-screen">Board Screen</div>
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
        
        manager.setAttribute('active-view', 'board');
        await new Promise(resolve => setTimeout(resolve, 0));
        
        const board = document.getElementById('view-board');
        expect(board.classList.contains('active')).toBe(true);
        
        manager.setAttribute('active-view', 'api-key');
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(board.classList.contains('active')).toBe(false);
        expect(document.getElementById('view-api-key').classList.contains('active')).toBe(true);
    });

    it('should transition to board screen on navigate-to event', async () => {
        await loadScreenManager();
        const manager = document.querySelector('screen-manager');
        
        document.getElementById('view-api-key').classList.add('active');
        manager.dispatchEvent(new CustomEvent('navigate-to', {
            detail: { destination: 'board' },
            bubbles: true
        }));
        
        expect(document.getElementById('view-board').classList.contains('active')).toBe(true);
    });

    it('should transition to api-key screen on navigate-to event', async () => {
        await loadScreenManager();
        const manager = document.querySelector('screen-manager');
        
        document.getElementById('view-board').classList.add('active');
        manager.dispatchEvent(new CustomEvent('navigate-to', {
            detail: { destination: 'api-key' },
            bubbles: true
        }));
        
        expect(document.getElementById('view-api-key').classList.contains('active')).toBe(true);
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
        
        const allScreens = manager.querySelectorAll('.view-screen');
        const activeCount = Array.from(allScreens).filter(s => s.classList.contains('active')).length;
        expect(activeCount).toBe(0);
    });

    it('should only manage its direct children, not settings views', async () => {
        await loadScreenManager();
        const manager = document.querySelector('screen-manager');
        
        const settingsView = document.createElement('div');
        settingsView.id = 'view-settings';
        settingsView.className = 'view-screen';
        manager.appendChild(settingsView);
        
        manager.dispatchEvent(new CustomEvent('navigate-to', {
            detail: { destination: 'settings' },
            bubbles: true
        }));
        
        expect(settingsView.classList.contains('active')).toBe(true);
        expect(document.getElementById('view-api-key').classList.contains('active')).toBe(false);
    });
});
