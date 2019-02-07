const RANKS = 'Owner|Admin|TS-Admin|Developer|Moderator|Supporter|Designer|Content|YouTuber+|Youtuber+|Supreme|Champ|Griefer|Titan|Legende|YouTuber|Youtuber|Ultra|Premium|Spieler';

export const config = {
  NORMAL_COOLDOWN: 3050,
  SLOW_COOLDOWN: 4050,
  PORTAL_COOLDOWN: 12000,
  PORTAL_TIMEOUT: 30000,
  MSG_REGEXP: /^\[(\w+) \| ([A-Za-z0-9_]{1,16}) -> mir\] (.+)/,
  CHATMODE_ALERT_REGEXP: /^Der Chat wurde von (\w+) \| ([A-Za-z0-9_]{1,16}) (.+)\./,
  SLOWCHAT_ALERT_REGEXP: /^Du kannst nur jede 3 Sekunden schreiben./,

  // Coded expressions
  // These only match if tested against coded messages.
  // &f, &l, &r, etc.
  PAY_REGEXP: new RegExp(`^[&\\w]{2,}(${RANKS}) \\| ([A-Za-z0-9_]{1,16}) &ahat dir \\$(\\S+) gegeben\\.$`),
};
