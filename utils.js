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
var getII = (id) => Number.parseInt(document.getElementById(id).value);

var getIS = (id) => document.getElementById(id).value;

var getICol = (id) => Color.fromStyle(document.getElementById(id).value);
