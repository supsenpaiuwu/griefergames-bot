"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RANKS = 'Owner|Admin|TS-Admin|Developer|Moderator|Supporter|Designer|Content|YouTuber+|Youtuber+|Supreme|Champ|Griefer|Titan|Legende|YouTuber|Youtuber|Ultra|Premium|Spieler';
exports.config = {
    NORMAL_COOLDOWN: 3050,
    SLOW_COOLDOWN: 4050,
    PORTAL_COOLDOWN: 12000,
    PORTAL_TIMEOUT: 30000,
    MSG_REGEXP: /^\[(\w+) \| ([A-Za-z0-9_]{1,16}) -> mir\] (.+)/,
    CHATMODE_ALERT_REGEXP: /^Der Chat wurde von (\w+) \| ([A-Za-z0-9_]{1,16}) (.+)\./,
    SLOWCHAT_ALERT_REGEXP: /^Du kannst nur jede 3 Sekunden schreiben./,
    PAY_REGEXP: new RegExp(`^[&\\w]{2,}(${RANKS}) \\| ([A-Za-z0-9_]{1,16}) &ahat dir \\$(\\S+) gegeben\\.$`),
};
