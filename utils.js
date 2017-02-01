function randInt(range) {
    return Math.floor(Math.random() * range);
}

function makeReadOnly(obj, prop) {
    Object.defineProperty(obj, prop, {writable: false, configurable: false});
}
