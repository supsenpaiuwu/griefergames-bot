"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vec3_1 = __importDefault(require("vec3"));
const config_1 = require("../config");
function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
function waitForSpawn(bot) {
    return new Promise((resolve) => {
        bot.client.once('spawn', resolve);
    });
}
async function run(bot, options) {
    const timeout = setTimeout(() => {
        throw new Error('Timed out while connecting on CityBuild.');
    }, config_1.config.PORTAL_TIMEOUT);
    bot.sendCommand('portal');
    await waitForSpawn(bot);
    await delay(3000);
    const [startX, startY, startZ] = options.start;
    const startPos = vec3_1.default(startX, startY, startZ);
    try {
        await bot.client.navigate.promise.to(startPos);
    }
    catch (e) {
        throw new Error('Stuck in connector.');
    }
    await delay(500);
    const [portalX, portalY, portalZ] = options.portal;
    const portalPos = vec3_1.default(portalX, portalY, portalZ);
    bot.client.setControlState('sprint', true);
    bot.client.setControlState('jump', true);
    bot.client.setControlState('forward', true);
    await delay(200);
    bot.client.setControlState('jump', false);
    await delay(300);
    bot.client.clearControlStates();
    await delay(2000);
    const [frontX, frontY, frontZ] = options.front;
    const frontPos = vec3_1.default(frontX, frontY, frontZ);
    try {
        await bot.client.navigate.promise.to(frontPos);
    }
    catch (e) {
        throw new Error('Stuck in connector.');
    }
    await delay(2000);
    bot.client.lookAt(portalPos, true);
    bot.client.setControlState('sprint', true);
    bot.client.setControlState('forward', true);
    bot.client.setControlState('jump', true);
    await waitForSpawn(bot);
    bot.client.clearControlStates();
    clearTimeout(timeout);
}
exports.connectorTask = run;
