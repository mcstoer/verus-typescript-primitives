"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toLowerCaseCLocale = void 0;
// A toLowerCase function that matches the "C" locale
const toLowerCaseCLocale = (str) => {
    let lower = "";
    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        const char = str.charAt(i);
        if (charCode < 128) {
            lower += char.toLowerCase();
        }
        else
            lower += char;
    }
    return lower;
};
exports.toLowerCaseCLocale = toLowerCaseCLocale;
