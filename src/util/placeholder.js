const CIM = require("case-insensitive-map");

const map = new CIM();

function escape(pattern) {
    if (typeof pattern !== 'string') throw new TypeError('Expected a string');
    return pattern
        .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
        .replace(/-/g, '\\x2d');
}

function get(placeholder) {
    placeholder = escape(placeholder);
    if (map.has(placeholder)) return map.get(placeholder);
    const pattern = new RegExp(`[{]${placeholder}[}]`, "ig");
    map.set(placeholder, pattern);
    return pattern;
}

function apply(text, placeholder, value) {
    return text.replace(get(placeholder), value);
}
module.exports = () =>
    global.placeholder = (txt, plh, val) => {
        if (typeof txt !== 'string') throw new TypeError('Expected a string');
        switch (typeof plh) {
            case "string":
                return apply(txt, plh, val ?? "");
            case "object":
                if (plh.constructor === Object)
                    plh = Object.entries(plh);
                else if (plh instanceof Map)
                    plh = Array.from(plh)
                        .map(([p, v]) => [p, v]);
                if (!(plh instanceof Array)) return txt;
                for (const [p, v] of plh)
                    txt = apply(txt, p, v);
                return txt;
            default: return txt;
        }
    }

