/**
 * Train / TGV icon.
 */
export function iconTrain({ size = 24, className = '' } = {}) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}">
    <rect x="4" y="4" width="16" height="14" rx="2" ry="2"/>
    <line x1="8" y1="18" x2="8" y2="22"/>
    <line x1="16" y1="18" x2="16" y2="22"/>
    <line x1="4" y1="11" x2="20" y2="11"/>
    <line x1="8" y1="7" x2="16" y2="7"/>
    <circle cx="8.5" cy="15" r="1"/>
    <circle cx="15.5" cy="15" r="1"/>
  </svg>`;
}
