import { vi } from 'vitest';

describe('initAutocomplete clear button', () => {
    const storedItems = {};

    function setupDom() {
        document.body.innerHTML = `
            <div class="app-layout">
                <screen-manager>
                    <div id="view-board" class="view-screen active">
                        <div id="journeys-board"></div>
                        <header class="view-header">
                            <h1 id="route-display"></h1>
                            <button id="quick-fav-btn" class="icon-btn">
                                <span class="icon-placeholder" data-icon="star" data-size="24"></span>
                            </button>
                            <button id="go-settings-btn"></button>
                        </header>
                        <div class="search-section">
                            <div class="input-row" id="input-row">
                                <button id="search-action-btn"></button>
                            </div>
                        </div>
                        <button id="manual-refresh-btn"></button>
                    </div>
                    <div id="view-settings" class="view-screen">
                        <header class="view-header">
                            <button class="back-btn" data-target="board"></button>
                            <h1>Réglages</h1>
                            <div style="width: 44px;"></div>
                        </header>
                        <ul class="settings-list">
                            <li class="settings-item" data-navigate="settings-favorites"></li>
                            <li class="settings-item" data-navigate="settings-filters"></li>
                            <li class="settings-item-static">
                                <span class="item-icon"><span class="icon-placeholder" data-icon="sun" data-size="22"></span></span>
                                <span class="item-label">Mode Sombre</span>
                                <label class="switch">
                                    <input id="theme-toggle" type="checkbox">
                                    <span class="slider"></span>
                                </label>
                            </li>
                            <li class="settings-item" data-navigate="settings-api-key"></li>
                        </ul>
                    </div>
                    <div id="view-settings-favorites" class="view-screen"><favorites-manager></favorites-manager></div>
                    <div id="view-settings-filters" class="view-screen"><search-settings></search-settings></div>
                    <div id="view-settings-api-key" class="view-screen">
                        <header class="view-header">
                            <button class="back-btn" data-target="settings"></button>
                            <h1>Clé API SNCF</h1>
                            <div style="width: 44px;"></div>
                        </header>
                        <input id="api-key-settings-input">
                        <button id="api-key-settings-save"></button>
                        <button id="api-key-clear-btn"></button>
                        <p id="api-key-settings-msg" style="display:none;"></p>
                    </div>
                    <div id="view-api-key" class="view-screen">
                        <input id="api-key-input">
                        <button id="api-key-submit"></button>
                        <p id="api-key-error" style="display:none;"></p>
                    </div>
                </screen-manager>
            </div>
        `;
    }

    async function loadMain() {
        const { currentConfig } = await import('../../src/state.js');
        currentConfig.apiKey = 'test-api-key';
        await import('../../src/components/screen-manager/screen-manager.js');
        await import('../../src/components/auto-complete/auto-complete.js');
        await import('../../src/main.js');
        setupAutocomplete();
        document.dispatchEvent(new Event('DOMContentLoaded'));
        return { currentConfig };
    }

    function setupAutocomplete() {
        const inputRow = document.getElementById('input-row');
        const autoComplete = document.createElement('auto-complete');
        autoComplete.id = 'dest-autocomplete';
        autoComplete.setAttribute('placeholder', 'Où allez-vous ? (ex: Vichy)');
        
        const clearBtn = document.createElement('clear-button');
        clearBtn.id = 'dest-clear-btn';
        clearBtn.setAttribute('size', '16');
        
        autoComplete.appendChild(clearBtn);
        inputRow.insertBefore(autoComplete, document.getElementById('search-action-btn'));
        
        return autoComplete;
    }

    beforeEach(() => {
        vi.stubGlobal('localStorage', {
            getItem: (key) => storedItems[key] || null,
            setItem: (key, value) => { storedItems[key] = value; },
            removeItem: (key) => { delete storedItems[key]; },
            clear: () => { Object.keys(storedItems).forEach(k => delete storedItems[k]); }
        });

        vi.stubGlobal('navigator', {
            geolocation: {
                getCurrentPosition: (success) => success({
                    coords: { latitude: 46.2, longitude: 3.4 }
                })
            }
        });

        vi.stubGlobal('window', {
            dispatchEvent: () => true,
            addEventListener: () => {},
            removeEventListener: () => {},
            matchMedia: () => ({ matches: false })
        });

        vi.resetModules();
        setupDom();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        Object.keys(storedItems).forEach(k => delete storedItems[k]);
    });

    it('should keep clear button hidden when input is empty', async () => {
        await loadMain();

        const autoComplete = document.getElementById('dest-autocomplete');
        const input = autoComplete.shadowRoot.getElementById('autocomplete-input');
        const clearBtn = document.getElementById('dest-clear-btn');

        input.value = '';
        input.dispatchEvent(new Event('input'));

        expect(clearBtn.getAttribute('input-has-content') !== 'true').toBe(true);
    });

    it('should show clear button when input has text', async () => {
        await loadMain();

        const autoComplete = document.getElementById('dest-autocomplete');
        const input = autoComplete.shadowRoot.getElementById('autocomplete-input');
        const clearBtn = document.getElementById('dest-clear-btn');

        input.value = 'Paris';
        input.dispatchEvent(new Event('input'));

        expect(clearBtn.getAttribute('input-has-content')).toBe('true');
    });

    it('should empty input, hide suggestions, and hide clear button on click', async () => {
        await loadMain();

        const autoComplete = document.getElementById('dest-autocomplete');
        const input = autoComplete.shadowRoot.getElementById('autocomplete-input');
        const clearBtn = document.getElementById('dest-clear-btn');

        input.value = 'Paris';
        input.dispatchEvent(new Event('input'));

        autoComplete.items = [
            { id: 'stop_area:SNCF:123456', label: 'Paris Gare de Lyon' }
        ];

        const dropdown = autoComplete.shadowRoot.getElementById('suggestions-dropdown');
        expect(dropdown.style.display).toBe('block');

        clearBtn.click();

        expect(input.value).toBe('');
        expect(dropdown.style.display).toBe('none');
        expect(clearBtn.getAttribute('input-has-content')).toBe('false');
    });

    it('should keep clear button hidden after clearing empty input', async () => {
        await loadMain();

        const autoComplete = document.getElementById('dest-autocomplete');
        const input = autoComplete.shadowRoot.getElementById('autocomplete-input');
        const clearBtn = document.getElementById('dest-clear-btn');

        input.value = 'Paris';
        input.dispatchEvent(new Event('input'));
        expect(clearBtn.getAttribute('input-has-content')).toBe('true');

        input.value = '';
        input.dispatchEvent(new Event('input'));
        expect(clearBtn.getAttribute('input-has-content')).toBe('false');
    });
});
