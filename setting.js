var Setting = {};
Setting.wrapperClass = "setting_wrapper";
Setting.labelClass = "setting_label";
Setting.idCount = 0;

var newSettingWrapper = () => newElement("div", {class: Setting.wrapperClass});
var newSettingLabel = labelText => newElement("label", {class: Setting.labelClass}, labelText);
var newElement = (tag, attr, txt) => {
    var el = document.createElement(tag);
    el.setAttribute("id", genId());
    if (attr)
        Object.keys(attr).forEach(pr => el.setAttribute(pr, attr[pr]));
    if (txt)
        el.textContent = txt;
    return el;
};

var getId = el => el.getAttribute("id");
var elemById = id => document.getElementById(id);
var forEachEntry = (obj, action) => Object.keys(obj).forEach(pr => action(pr, obj[pr]));
var checkNoIdInAttrMap = (obj) => {
     if (obj["id"])
        throw "Id attribute must not be specified.";
};
var genId = () => "setting_##_" + Setting.idCount++;

function MultiSetting(elements, resultProvider) {
    var elem = newSettingWrapper();
    elements.forEach(el => elem.appendChild(el));
    
    this.getSettingElement = () => elem;
    this.get = () => resultProvider();
}

function InputSetting(labelText, inputAttributes, valueMapper) {
    checkNoIdInAttrMap(inputAttributes);
    var elem = newSettingWrapper();
    if (labelText)
        elem.appendChild(newSettingLabel(labelText));
    var input = elem.appendChild(newElement("input", inputAttributes));
    
    this.getSettingElement = () => elem;
    this.get = () => valueMapper(input.value);
};

function SelectSetting(labelText, valueTextMap, selectAttrs, valueMapper, changeListener) {
    checkNoIdInAttrMap(selectAttrs);
    var elem = newSettingWrapper();
    if (labelText)
        elem.appendChild(newSettingLabel(labelText));
    var select = elem.appendChild(newElement("select", selectAttrs));
    forEachEntry(valueTextMap, (va, txt) => select.appendChild(newElement("option", {value: va}, txt)));
    if (changeListener)
        select.addEventListener("change", changeListener);
    
    this.getSettingElement = () => elem;
    this.get = () => valueMapper(select.value);
}
