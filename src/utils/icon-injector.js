import {
    iconStar,
    iconCog,
    iconArrowLeft,
    iconChevronRight,
    iconBus,
    iconTrain,
    iconRefresh,
    iconSearch,
    iconClock,
    iconSun,
    iconMoon,
    iconX
} from '../icons/index.js';

const iconMap = {
    'star': iconStar,
    'cog': iconCog,
    'arrow-left': iconArrowLeft,
    'chevron-right': iconChevronRight,
    'bus': iconBus,
    'train': iconTrain,
    'refresh': iconRefresh,
    'search': iconSearch,
    'clock': iconClock,
    'sun': iconSun,
    'moon': iconMoon,
    'x': iconX
};

export function injectIcons() {
    document.querySelectorAll('.icon-placeholder').forEach(el => {
        const name = el.dataset.icon;
        const filled = el.dataset.filled === 'true';
        const size = parseInt(el.dataset.size, 10) || 20;
        const iconFn = iconMap[name];
        if (iconFn) {
            el.innerHTML = iconFn({ size, className: '', filled });
        }
    });
}
