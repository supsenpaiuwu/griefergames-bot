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
const CARDINAL_YAWS = {
    NORTH: 0,
    NORTH_WEST: (1 * Math.PI) / 4,
    WEST: Math.PI / 2,
    SOUTH_WEST: (3 * Math.PI) / 4,
    SOUTH: Math.PI,
    SOUTH_EAST: (5 * Math.PI) / 4,
    EAST: (3 * Math.PI) / 2,
    NORTH_EAST: (7 * Math.PI) / 4,
};
async function run(bot, options) {
    const timeout = setTimeout(() => {
        throw new Error('Timed out while connecting on CityBuild.');
    }, config_1.config.PORTAL_TIMEOUT);
    let startPos;
    let lookDirection;
    switch (options.start) {
        case 0:
            startPos = vec3_1.default(324, 117, 277);
            lookDirection = [CARDINAL_YAWS.NORTH_WEST, 0];
            break;
        case 1:
            startPos = vec3_1.default(326, 117, 277);
            lookDirection = [CARDINAL_YAWS.NORTH_EAST, 0];
            break;
        case 2:
            startPos = vec3_1.default(326, 117, 283);
            lookDirection = [CARDINAL_YAWS.SOUTH_EAST, 0];
            break;
        case 3:
            startPos = vec3_1.default(324, 117, 283);
            lookDirection = [CARDINAL_YAWS.SOUTH_WEST, 0];
            break;
        default:
            throw new Error('Start position not provided! Check path file.');
    }
    bot.sendCommand('portal');
    await waitForSpawn(bot);
    await delay(3000);
    try {
        await bot.client.navigate.promise.to(startPos);
    }
    catch (e) {
        throw new Error('Stuck in connector.');
    }
    await delay(500);
    const [yaw, pitch] = lookDirection;
    bot.client.look(yaw, pitch, true);
    await delay(500);
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
    const [portalX, portalY, portalZ] = options.portal;
    const portalPos = vec3_1.default(portalX, portalY, portalZ);
    bot.client.lookAt(portalPos, true);
    bot.client.setControlState('sprint', true);
    bot.client.setControlState('forward', true);
    bot.client.setControlState('jump', true);
    await waitForSpawn(bot);
    bot.client.clearControlStates();
    clearTimeout(timeout);
}
exports.connectorTask = run;
//# sourceMappingURL=connector.js.map