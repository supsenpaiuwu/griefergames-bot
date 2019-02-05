export interface Options {
  username: string;
  password: string;
  cacheSessions?: boolean;
  logMessages?: boolean;
  // proxy?: Proxy
}

export interface Proxy {
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export interface Session {
  accessToken: string;
  clientToken: string;
  selectedProfile: {
    id: string;
    name: string;
  };
}

// export interface PathPacket {
//   data: any;
//   delta: number;
//   name: string;
// }

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface ConnectorOptions {
  name: string;
  start: number[];
  front: number[];
  portal: number[];
}
