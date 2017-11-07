export function isVisible(elt: Element) {
    var style = window.getComputedStyle(elt);
    return +style.width !== 0
        && +style.height !== 0
        && +style.opacity !== 0
        && style.display !== 'none'
        && style.visibility !== 'hidden';
}

export function adjust<T>(
    x: T, 
    ...applyAdjustmentList: ((x: T) => void)[]
): T {
    for (let applyAdjustment of applyAdjustmentList) {
        applyAdjustment(x);
    }
    return x;
}