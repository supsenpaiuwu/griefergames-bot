"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function buildPath(email) {
    return path_1.default.join(__dirname, `../sessions/session-${email.toLowerCase()}.json`);
}
// Attempt to load a session from its accociated file.
function load(email) {
    const data = fs_1.default.readFileSync(buildPath(email), 'utf-8');
    const session = JSON.parse(data);
    return session;
}
// Alias for "load"
function get(email) {
    return load(email);
}
exports.get = get;
// Attempt to save session to its own file.
function save(session) {
    fs_1.default.writeFileSync(buildPath(session.email), JSON.stringify(session), 'utf8');
}
exports.save = save;
// Attempt to delete the session file accociated to given email address.
function remove(email) {
    fs_1.default.unlinkSync(buildPath(email));
}
exports.remove = remove;
// // Attempt to load a session from its accociated file.
// function load(email: string): Promise<interfaces.Session> {
//   return new Promise((resolve, reject) => {
//     fs.readFile(buildPath(email), 'utf8', (e, data) => {
//       if (e) {
//         reject(e);
//         return;
//       }
//       let session: interfaces.Session;
//       try {
//         session = JSON.parse(data);
//       } catch (e) {
//         reject(e);
//         return;
//       }
//       resolve(session);
//     });
//   });
// }
// // Attempts to get a session from its accociated file.
// export function get(email: string): Promise<interfaces.Session> {
//   return new Promise((resolve, reject) => {
//     load(email)
//     .then(session => resolve(session))
//     .catch(e => reject(e))
//   });
// }
// // Attempts to save a session to its own file.
// export function save(session: interfaces.Session): Promise<void> {
//   return new Promise((resolve, reject) => {
//     fs.writeFile(buildPath(session.email), JSON.stringify(session), 'utf8', (e) => {
//       if (e) {
//         reject(e);
//         return;
//       }
//       resolve();
//     });
//   });
// }
// // Attempts to delete the session file accociated to the given email address.
// export function remove(email: string): Promise<void> {
//   return new Promise((resolve, reject) => {
//     fs.unlink(buildPath(email), (e) => {
//       if (e) {
//         reject(e);
//         return;
//       }
//       resolve();
//     });
//   });
// }
