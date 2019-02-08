interface JsonChat {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strikethrough?: boolean;
  obfuscated?: boolean;
  color?: string;
  extra?: JsonChat[];
  [key: string]: any;
  // There are additional (unnecessary) properties
  // See: https://wiki.vg/Chat
}

const ChatCodes = {
  BLACK: '&0',
  DARK_BLUE: '&1',
  DARK_GREEN: '&2',
  DARK_AQUA: '&3',
  DARK_RED: '&4',
  DARK_PURPLE: '&5',
  GOLD: '&6',
  GRAY: '&7',
  DARK_GRAY: '&8',
  BLUE: '&9',
  GREEN: '&a',
  AQUA: '&b',
  RED: '&c',
  LIGHT_PURPLE: '&d',
  YELLOW: '&e',
  WHITE: '&f',

  BOLD: '&l',
  ITALIC: '&o',
  UNDERLINE: '&n',
  STRIKETHROUGH: '&m',
  OBFUSCATED: '&k',
  RESET: '&r',

  get: (c: string): string => ChatCodes[c] || ''
};

// Turns a JSON chat into a Minecraft color code string.
// Multi-type for recursion.
function jsonToCodedText(item: JsonChat | JsonChat[] | string): string {
  let message = '';

  // Servers sometimes send messages that
  // don't follow the specs.
  // As far as I know, vanilla messages (e.g. achievements)
  // can also be strings.
  if (typeof item === 'string') {
    return item;
  }

  if (typeof item === 'object') {
    if (Array.isArray(item)) {
      // We're looking at an array of 'extra' items.
      for (const element of item) {
        message += jsonToCodedText(element);
      }
    } else {
      // We're looking at a specific 'extra' item.
      const {
        text,
        color,
        extra,
        bold,
        italic,
        underlined,
        strikethrough,
        obfuscated
      } = item;

      if (color) {
        message += ChatCodes.get(color.toUpperCase());
      }

      if (bold) {
        message += ChatCodes['BOLD'];
      }

      if (italic) {
        message += ChatCodes['ITALIC'];
      }

      if (underlined) {
        message += ChatCodes['UNDERLINED'];
      }

      if (strikethrough) {
        message += ChatCodes['STRIKETHROUGH'];
      }

      if (obfuscated) {
        message += ChatCodes['OBFUSCATED'];
      }

      message += text;

      if (extra) {
        message += jsonToCodedText(extra);
      }
    }
  }

  // Servers, again, sometimes send messages
  // that don't follow the specs.
  message = message.replace(/§/g, '&');
  return message;
}

// Turns a JSON chat into a string.
function jsonToText(item: JsonChat | JsonChat[]): string {
  return stripCodes(jsonToCodedText(item));
}

// Strips a color-coded string of its colors.
function stripCodes(text: string): string {
  return text.replace(/&[A-F0-9K-OR]/ig, '');
}

export {
  jsonToText,
  jsonToCodedText,
  stripCodes
};
