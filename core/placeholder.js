const CIM = require("case-insensitive-map");

const map = new CIM();

function escape(pattern) {
    if (typeof pattern !== 'string') throw new TypeError('Expected a string');
    return pattern.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
}

function get(placeholder) {
    placeholder = escape(placeholder);
    if (map.has(placeholder)) return map.get(placeholder);
    const pattern = new RegExp(`[{]${placeholder}[}]`);
    map.set(placeholder, pattern);
    return pattern;
}

function apply(text, placeholder, value) {
    if (typeof text !== 'string') throw new TypeError('Expected a string');
    return text.replace(get(placeholder), value);
}

module.exports.apply = (text, placeholder, value) => apply(text, placeholder, value);

