import { vi } from 'vitest';

describe('initAutocomplete clear button', () => {
    const storedItems = {};

    function setupDom() {
        document.body.innerHTML = `
            <div class="app-layout">
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
                        <div class="autocomplete-container">
                            <input id="dest-input" class="text-input" value="">
                            <div id="suggestions-box" class="suggestions-dropdown"></div>
                            <clear-button id="dest-clear-btn" size="16"></clear-button>
                        </div>
                        <button id="search-action-btn"></button>
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
            </div>
        `;
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

    async function loadMain() {
        const { currentConfig } = await import('../../src/state.js');
        currentConfig.apiKey = 'test-api-key';
        await import('../../src/main.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));
        return { currentConfig };
    }

    it('should keep clear button hidden when input is empty', async () => {
        await loadMain();

        const input = document.getElementById('dest-input');
        const clearBtn = document.getElementById('dest-clear-btn');

        input.value = '';
        input.dispatchEvent(new Event('input'));

        expect(clearBtn.getAttribute('input-has-content') !== 'true').toBe(true);
    });

    it('should show clear button when input has text', async () => {
        await loadMain();

        const input = document.getElementById('dest-input');
        const clearBtn = document.getElementById('dest-clear-btn');

        input.value = 'Paris';
        input.dispatchEvent(new Event('input'));

        expect(clearBtn.getAttribute('input-has-content')).toBe('true');
    });

    it('should empty input, hide suggestions, and hide clear button on click', async () => {
        await loadMain();

        const input = document.getElementById('dest-input');
        const clearBtn = document.getElementById('dest-clear-btn');
        const suggestionsBox = document.getElementById('suggestions-box');

        input.value = 'Paris';
        input.dispatchEvent(new Event('input'));

        suggestionsBox.innerHTML = '<div class="suggestion-item">Paris Gare de Lyon</div>';
        suggestionsBox.style.display = 'block';

        clearBtn.click();

        expect(input.value).toBe('');
        expect(suggestionsBox.style.display).toBe('none');
        expect(clearBtn.getAttribute('input-has-content')).toBe('false');
    });

    it('should keep clear button hidden after clearing empty input', async () => {
        await loadMain();

        const input = document.getElementById('dest-input');
        const clearBtn = document.getElementById('dest-clear-btn');

        input.value = 'Paris';
        input.dispatchEvent(new Event('input'));
        expect(clearBtn.getAttribute('input-has-content')).toBe('true');

        input.value = '';
        input.dispatchEvent(new Event('input'));
        expect(clearBtn.getAttribute('input-has-content')).toBe('false');
    });
});
