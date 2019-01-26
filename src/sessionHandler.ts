import fs from 'fs';
import path from 'path';
import mojang from 'mojang';

import { Session } from './interfaces';

function buildPath(email: string): string {
  return path.join(__dirname, `../sessions/session-${email.toLowerCase()}.json`);
}

async function create(email: string, password: string): Promise<Session> {
  try {
    const { accessToken, clientToken, selectedProfile } = await mojang.authenticate({
      username: email,
      password,
      agent: { name: 'Minecraft', version: 1 },
    });

    return { accessToken, clientToken, selectedProfile };
  } catch (e) {
    throw e;
  }
}

async function validate(session: Session): Promise<boolean> {
  try {
    const isValid = await mojang.isValid(session);

    return isValid;
  } catch (e) {
    return false;
  }
}

async function refresh(session: Session): Promise<Session> {
  return mojang.refresh(session);
}

async function getSessionFromSaved(email: string): Promise<Session> {
  let session;
  try {
    session = await load(email);
  } catch (loadErr) {
    throw loadErr;
  }

  let isValid;
  try {
    isValid = await validate(session);
  } catch (validationErr) {
    isValid = false;
  }

  // Refresh if not valid anymore.
  if (!isValid) {
    try {
      session = await refresh(session);
    } catch (refreshError) {
      throw refreshError;
    }
  }

  // Return a saved and validated session
  // or a refreshed session.
  return session;
}

export async function getValidSession(email: string, password: string): Promise<Session> {
  let session;
  try {
    session = await getSessionFromSaved(email);
  } catch (retrieveErr) {
    // If it can't be retrieved, make a new one.
    try {
      session = await create(email, password);
    } catch (createErr) {
      throw createErr;
    }
  }

  try {
    await save(session, email);
  } catch (saveErr) {
    throw saveErr;
  }

  return session;
}

function load(email: string): Promise<Session> {
  return new Promise((resolve, reject) => {
    fs.readFile(buildPath(email), 'utf8', (e, data) => {
      if (e) {
        reject(e);
        return;
      }

      let session: Session;

      try {
        session = JSON.parse(data);
      } catch (e) {
        reject(e);
        return;
      }

      resolve(session);
    });
  });
}

function save(session: Session, email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(buildPath(email), JSON.stringify(session), (e) => {
      if (e) {
        reject(e);
        return;
      }

      resolve();
    });
  });
}
