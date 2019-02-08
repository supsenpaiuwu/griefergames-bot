export interface Options {
    username: string;
    password: string;
    cacheSessions?: boolean;
    logMessages?: boolean;
}
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
