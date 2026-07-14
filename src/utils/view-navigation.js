/**
 * Toggle the active view screen within a given root element.
 *
 * Removes the `active` class from every `.view-screen` descendant of `root`,
 * then adds it to the element whose id matches `#view-<screenId>`.
 * Shared by `<screen-manager>` and `<settings-panel>` to keep view-transition
 * behavior consistent and avoid drift between the two components.
 *
 * @param {ParentNode} root - The element that owns the view screens.
 * @param {string} screenId - The screen id suffix (e.g. "board", "settings").
 */
export function activateView(root, screenId) {
    if (!root) return;

    root.querySelectorAll('.view-screen').forEach(scr => {
        scr.classList.remove('active');
    });

    const target = root.querySelector(`#view-${screenId}`);
    if (target) {
        target.classList.add('active');
    }
}
