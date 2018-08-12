export function isVisible(elt: Element) {
    const style = window.getComputedStyle(elt);
    return +style.width !== 0
        && +style.height !== 0
        && +style.opacity !== 0
        && style.display !== "none"
        && style.visibility !== "hidden";
}

export function adjust<T>(
    x: T,
    ...applyAdjustmentList: Array<(x: T) => void>
): T {
    for (const applyAdjustment of applyAdjustmentList) {
        applyAdjustment(x);
    }
    return x;
}
