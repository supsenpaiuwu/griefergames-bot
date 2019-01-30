"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mojang_1 = __importDefault(require("mojang"));
function buildPath(email) {
    return path_1.default.join(__dirname, `../sessions/session-${email.toLowerCase()}.json`);
}
async function create(email, password) {
    try {
        const { accessToken, clientToken, selectedProfile } = await mojang_1.default.authenticate({
            username: email,
            password,
            agent: { name: 'Minecraft', version: 1 },
        });
        return { accessToken, clientToken, selectedProfile };
    }
    catch (e) {
        throw e;
    }
}
async function validate(session) {
    try {
        const isValid = await mojang_1.default.isValid(session);
        return isValid;
    }
    catch (e) {
        return false;
    }
}
async function refresh(session) {
    return mojang_1.default.refresh(session);
}
async function getSessionFromSaved(email) {
    let session;
    try {
        session = await load(email);
    }
    catch (loadErr) {
        throw loadErr;
    }
    const isValid = await validate(session);
    if (!isValid) {
        try {
            session = await refresh(session);
        }
        catch (refreshError) {
            throw refreshError;
        }
    }
    return session;
}
async function getValidSession(email, password) {
    let session;
    try {
        session = await getSessionFromSaved(email);
    }
    catch (retrieveErr) {
        try {
            session = await create(email, password);
        }
        catch (createErr) {
            throw createErr;
        }
    }
    try {
        await save(session, email);
    }
    catch (saveErr) {
        throw saveErr;
    }
    return session;
}
exports.getValidSession = getValidSession;
function load(email) {
    return new Promise((resolve, reject) => {
        fs_1.default.readFile(buildPath(email), 'utf8', (e, data) => {
            if (e) {
                reject(e);
                return;
            }
            let session;
            try {
                session = JSON.parse(data);
            }
            catch (e) {
                reject(e);
                return;
            }
            resolve(session);
        });
    });
}
function save(session, email) {
    return new Promise((resolve, reject) => {
        fs_1.default.writeFile(buildPath(email), JSON.stringify(session), (e) => {
            if (e) {
                reject(e);
                return;
            }
            resolve();
        });
    });
}
