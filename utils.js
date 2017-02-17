function randInt(range) {
    return Math.floor(Math.random() * range);
}

function makeReadOnly(obj, prop) {
    Object.defineProperty(obj, prop, {writable: false, configurable: false});
}

function moveToEnd(array, idx) {
    let temp = array[idx];
    array[idx] = array[array.length - 1];
    array[array.length - 1] = temp;
}
