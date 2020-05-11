export interface Options {
  username?: string;
  password?: string;
  // for mcleaks my fork of minecraft-protocol (https://github.com/Dominic11/node-minecraft-protocol) is needed
  mcLeaksToken?: string;
  cacheSessions?: boolean;
  logMessages?: boolean | LogMessagesOptions;
  additionalChatDelay?: number;
  solveAfkChallenge?: boolean;
  // proxy?: Proxy
}

export interface LogMessagesOptions {
  type: 'uncoded' | 'encoded' | 'ansi';
}

// export interface Proxy {
//   host: string;
//   port: number;
//   username?: string;
//   password?: string;
// }

export interface Session {
  accessToken: string;
  clientToken: string;
  selectedProfile: {
    id: string;
    name: string;
    [key: string]: any;
  };
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface ConnectorOptions {
  name: string;
  start: number;
  front: number[];
  portal: number[];
}
