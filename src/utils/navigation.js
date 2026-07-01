export function initNavigationRouter() {
    document.getElementById('go-settings-btn').addEventListener('click', () => {
        transitionToScreen('settings');
    });

    document.querySelectorAll('.settings-item').forEach(item => {
        item.addEventListener('click', () => {
            const dest = item.dataset.navigate;
            transitionToScreen(dest);
        });
    });

    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const dest = btn.dataset.target;
            transitionToScreen(dest);
        });
    });
}

export function transitionToScreen(screenId) {
    document.querySelectorAll('.view-screen').forEach(scr => {
        scr.classList.remove('active');
    });
    const target = document.getElementById(`view-${screenId}`);
    if (target) {
        target.classList.add('active');
    }
}
