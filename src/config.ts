export const config = {
  SERVER_IP: 'griefergames.net',
  SERVER_PORT: 25565,
  NORMAL_COOLDOWN: 3050,
  SLOW_COOLDOWN: 4050,
  PORTAL_COOLDOWN: 12000,
  PORTAL_TIMEOUT: 30000,
  MSG_REGEXP: /^\[(\w+) \| (\w{1,16}) -> mir\] (.+)$/,
  CHATMODE_ALERT_REGEXP: /^Der Chat wurde von (\w+) \| (\w{1,16}) (.+)\.$/,
  SLOWCHAT_ALERT_REGEXP: /^Du kannst nur jede 3 Sekunden schreiben.$/,
  COMMANDSPAM_ALERT_REGEXP: /^Bitte unterlasse das Spammen von Commands!$/,
  PAY_REGXP: /^(.+) \| (\w{1,16}) hat dir \$(\S+) gegeben\.$/,

  // Coded expressions
  // These only match if tested against coded messages.
  // §f, §l, §r, etc.
  CODED_PAY_REGEXP: /^(.+) \| (\w{1,16}) §ahat dir \$(\S+) gegeben\.$/,
};
