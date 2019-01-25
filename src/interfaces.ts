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
  id: string;
  name: string;
  email?: string;
}

export interface FormattedSession {
  accessToken: string;
  clientToken: string;
  selectedProfile: {
    id: string;
    name: string;
  };
}
