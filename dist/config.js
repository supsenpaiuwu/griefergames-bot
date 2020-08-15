"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = {
    SERVER_IP: 'griefergames.net',
    SERVER_PORT: 25565,
    NORMAL_COOLDOWN: 3050,
    SLOW_COOLDOWN: 4050,
    PORTAL_COOLDOWN: 12000,
    PORTAL_TIMEOUT: 60000,
    MSG_REGEXP: /^\[(\w+) \u2503 (\u007E?\w{1,16}) -> mir\] (.+)$/,
    CHATMODE_ALERT_REGEXP: /^Der Chat wurde von (\w+) \| (\w{1,16}) (.+)\.$/,
    SLOWCHAT_ALERT_REGEXP: /^Du kannst nur jede 3 Sekunden schreiben.$/,
    COMMANDSPAM_ALERT_REGEXP: /^Bitte unterlasse das Spammen von Commands!$/,
    PAY_REGXP: /^(.+) \u2503 (\u007E?\w{1,16}) hat dir \$(\S+) gegeben\.$/,
    REDSTONE_REGEXP: /^- Redstone (?:ist wieder )?(\w+)\!?$/,
    ITEMCLEAR_REGEXP: /^\[GrieferGames\] Warnung: Items auf dem Boden werden in (\w{2}) Sekunden entfernt\!$/,
    CODED_PAY_REGEXP: /^(.+) \| (.+) §ahat dir \$(\S+) gegeben\.$/,
};
//# sourceMappingURL=config.js.map