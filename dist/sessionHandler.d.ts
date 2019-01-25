import * as interfaces from './interfaces';
export declare function get(email: string): interfaces.Session;
export declare function save(session: interfaces.Session): void;
export declare function remove(email: string): void;
