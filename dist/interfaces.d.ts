export interface Options {
    username: string;
    password: string;
    cacheSessions?: boolean;
    logMessages?: boolean;
}
export interface Proxy {
    host: string;
    port: number;
    username?: string;
    password?: string;
}
export interface FormattedSession {
    accessToken: string;
    clientToken: string;
    selectedProfile: {
        id: string;
        name: string;
    };
}
