export function isVisible(elt: Element) {
    var style = window.getComputedStyle(elt);
    return +style.width !== 0
        && +style.height !== 0
        && +style.opacity !== 0
        && style.display !== 'none'
        && style.visibility !== 'hidden';
}
