"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripCodes = exports.jsonToCodedText = exports.jsonToText = void 0;
var ChatCodes;
(function (ChatCodes) {
    ChatCodes["BLACK"] = "\u00A70";
    ChatCodes["DARK_BLUE"] = "\u00A71";
    ChatCodes["DARK_GREEN"] = "\u00A72";
    ChatCodes["DARK_AQUA"] = "\u00A73";
    ChatCodes["DARK_RED"] = "\u00A74";
    ChatCodes["DARK_PURPLE"] = "\u00A75";
    ChatCodes["GOLD"] = "\u00A76";
    ChatCodes["GRAY"] = "\u00A77";
    ChatCodes["DARK_GRAY"] = "\u00A78";
    ChatCodes["BLUE"] = "\u00A79";
    ChatCodes["GREEN"] = "\u00A7a";
    ChatCodes["AQUA"] = "\u00A7b";
    ChatCodes["RED"] = "\u00A7c";
    ChatCodes["LIGHT_PURPLE"] = "\u00A7d";
    ChatCodes["YELLOW"] = "\u00A7e";
    ChatCodes["WHITE"] = "\u00A7f";
    ChatCodes["OBFUSCATED"] = "\u00A7k";
    ChatCodes["BOLD"] = "\u00A7l";
    ChatCodes["STRIKETHROUGH"] = "\u00A7m";
    ChatCodes["UNDERLINE"] = "\u00A7n";
    ChatCodes["ITALIC"] = "\u00A7o";
    ChatCodes["RESET"] = "\u00A7r";
})(ChatCodes || (ChatCodes = {}));
function jsonToCodedText(item) {
    let message = '';
    if (typeof item === 'string') {
        return item;
    }
    if (typeof item === 'object') {
        if (Array.isArray(item)) {
            for (const element of item) {
                message += jsonToCodedText(element);
            }
        }
        else {
            const { text, color, extra, bold, italic, underlined, strikethrough, obfuscated } = item;
            if (color) {
                message += ChatCodes[color.toUpperCase()] || '';
            }
            if (bold) {
                message += ChatCodes.BOLD;
            }
            if (italic) {
                message += ChatCodes.ITALIC;
            }
            if (underlined) {
                message += ChatCodes.UNDERLINE;
            }
            if (strikethrough) {
                message += ChatCodes.STRIKETHROUGH;
            }
            if (obfuscated) {
                message += ChatCodes.OBFUSCATED;
            }
            message += text;
            if (extra) {
                message += jsonToCodedText(extra);
            }
        }
    }
    return message;
}
exports.jsonToCodedText = jsonToCodedText;
function jsonToText(item) {
    return stripCodes(jsonToCodedText(item));
}
exports.jsonToText = jsonToText;
function stripCodes(text) {
    return text.replace(/\u00A7[0-9A-FK-OR]/gi, '');
}
exports.stripCodes = stripCodes;
//# sourceMappingURL=minecraftUtil.js.map