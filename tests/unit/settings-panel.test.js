import { vi } from 'vitest';

describe('SettingsPanel component', () => {
    function setupDom() {
        document.body.innerHTML = `
            <div class="app-layout">
                <screen-manager>
                    <div id="view-api-key" class="view-screen active">API Key Screen</div>
                    <div id="view-board" class="view-screen">Board Screen</div>
                </screen-manager>
                <settings-panel>
                    <div id="view-settings" class="view-screen">Settings Main</div>
                    <div id="view-settings-favorites" class="view-screen">Favorites Screen</div>
                    <div id="view-settings-filters" class="view-screen">Filters Screen</div>
                    <div id="view-settings-api-key" class="view-screen">API Key Settings</div>
                </settings-panel>
            </div>
        `;
    }

    async function loadSettingsPanel() {
        const module = await import('../../src/components/settings-panel/settings-panel.js');
        return module;
    }

    beforeEach(() => {
        vi.resetModules();
        setupDom();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should render element and exist after definition', async () => {
        await loadSettingsPanel();
        const panel = document.querySelector('settings-panel');
        expect(panel).toBeTruthy();
    });

    it('should start closed without active class', async () => {
        await loadSettingsPanel();
        const panel = document.querySelector('settings-panel');
        expect(panel.classList.contains('active')).toBe(false);
    });

    it('should open panel when open() is called', async () => {
        await loadSettingsPanel();
        const panel = document.querySelector('settings-panel');
        panel.open();
        expect(panel.classList.contains('active')).toBe(true);
    });

    it('should activate the main settings screen when opened', async () => {
        await loadSettingsPanel();
        const panel = document.querySelector('settings-panel');
        expect(document.getElementById('view-settings').classList.contains('active')).toBe(false);
        panel.open();
        expect(document.getElementById('view-settings').classList.contains('active')).toBe(true);
    });

    it('should reset to the main settings screen each time it opens', async () => {
        await loadSettingsPanel();
        const panel = document.querySelector('settings-panel');
        panel.open();
        panel.navigateTo('settings-favorites');
        expect(document.getElementById('view-settings-favorites').classList.contains('active')).toBe(true);
        panel.close();
        panel.open();
        expect(document.getElementById('view-settings').classList.contains('active')).toBe(true);
        expect(document.getElementById('view-settings-favorites').classList.contains('active')).toBe(false);
    });

    it('should close panel when close() is called', async () => {
        await loadSettingsPanel();
        const panel = document.querySelector('settings-panel');
        panel.open();
        expect(panel.classList.contains('active')).toBe(true);
        panel.close();
        expect(panel.classList.contains('active')).toBe(false);
    });

    it('should open panel on document settings-click event', async () => {
        await loadSettingsPanel();
        document.dispatchEvent(new CustomEvent('settings-click'));
        const panel = document.querySelector('settings-panel');
        expect(panel.classList.contains('active')).toBe(true);
    });

    it('should navigate to sub-screen on settings-item click', async () => {
        await loadSettingsPanel();
        const panel = document.querySelector('settings-panel');
        panel.open();

        const settingsItem = document.createElement('li');
        settingsItem.className = 'settings-item';
        settingsItem.dataset.navigate = 'settings-favorites';
        settingsItem.textContent = 'Favorites';
        document.getElementById('view-settings').appendChild(settingsItem);

        settingsItem.click();

        expect(document.getElementById('view-settings-favorites').classList.contains('active')).toBe(true);
        expect(document.getElementById('view-settings').classList.contains('active')).toBe(false);
    });

    it('should navigate back on back-btn click', async () => {
        await loadSettingsPanel();
        const panel = document.querySelector('settings-panel');
        panel.open();

        document.getElementById('view-settings-favorites').classList.add('active');

        const backBtn = document.createElement('button');
        backBtn.className = 'back-btn';
        backBtn.dataset.target = 'settings';
        document.getElementById('view-settings-favorites').appendChild(backBtn);

        backBtn.click();

        expect(document.getElementById('view-settings').classList.contains('active')).toBe(true);
        expect(document.getElementById('view-settings-favorites').classList.contains('active')).toBe(false);
    });

    it('should close panel on back-btn targeting an external view like board', async () => {
        await loadSettingsPanel();
        const panel = document.querySelector('settings-panel');
        panel.open();
        expect(panel.classList.contains('active')).toBe(true);

        const backBtn = document.createElement('button');
        backBtn.className = 'back-btn';
        backBtn.dataset.target = 'board';
        document.getElementById('view-settings').appendChild(backBtn);

        backBtn.click();

        // Closing must behave like a backdrop click: panel (and its backdrop) hidden.
        expect(panel.classList.contains('active')).toBe(false);
    });

    it('should close panel on backdrop click', async () => {
        await loadSettingsPanel();
        const panel = document.querySelector('settings-panel');
        panel.open();
        expect(panel.classList.contains('active')).toBe(true);

        const backdrop = panel.shadowRoot.querySelector('.panel-backdrop');
        expect(backdrop).toBeTruthy();
        backdrop.click();

        expect(panel.classList.contains('active')).toBe(false);
    });

    it('should have a backdrop element in shadow DOM', async () => {
        await loadSettingsPanel();
        const panel = document.querySelector('settings-panel');
        const backdrop = panel.shadowRoot.querySelector('.panel-backdrop');
        expect(backdrop).toBeTruthy();
    });

    it('should have a panel container in shadow DOM', async () => {
        await loadSettingsPanel();
        const panel = document.querySelector('settings-panel');
        const container = panel.shadowRoot.querySelector('.settings-panel-container');
        expect(container).toBeTruthy();
    });
});
