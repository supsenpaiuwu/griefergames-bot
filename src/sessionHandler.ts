import fs from 'fs';
import path from 'path';
import * as interfaces from './interfaces';

function buildPath(email: string): string {
  return path.join(__dirname, `../sessions/session-${email.toLowerCase()}.json`);
}

// Attempt to load a session from its accociated file.
function load(email: string): interfaces.Session {
  const data = fs.readFileSync(buildPath(email), 'utf-8');
  const session: interfaces.Session = JSON.parse(data);
  return session;
}

// Alias for "load"
export function get(email: string): interfaces.Session {
  return load(email);
}

// Attempt to save session to its own file.
export function save(session: interfaces.Session): void {
  fs.writeFileSync(buildPath(session.email), JSON.stringify(session), 'utf8');
}

// Attempt to delete the session file accociated to given email address.
export function remove(email: string): void {
  fs.unlinkSync(buildPath(email));
}

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
