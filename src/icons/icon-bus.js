/**
 * Bus icon.
 */
export function iconBus({ size = 24, className = '' } = {}) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}">
    <path d="M4 17h16v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6z"/>
    <path d="M4 17v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3"/>
    <path d="M16 17v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3"/>
    <line x1="8" y1="9" x2="16" y2="9"/>
    <circle cx="7" cy="17" r="1.5"/>
    <circle cx="17" cy="17" r="1.5"/>
  </svg>`;
}