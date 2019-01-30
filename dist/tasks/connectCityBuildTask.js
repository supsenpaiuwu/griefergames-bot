"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vec3_1 = __importDefault(require("vec3"));
const config_1 = require("../config");
function delay(amount) {
    return new Promise(resolve => {
        setTimeout(resolve, amount);
    });
}
function waitForSpawn(bot) {
    return new Promise(resolve => {
        bot.client.once('spawn', () => {
            resolve();
        });
    });
}
const startPos = vec3_1.default(324, 117, 277);
function run(bot, portalPos, portalFrontPos) {
    return new Promise((resolve, reject) => {
        const portalTimeout = setTimeout(() => {
            reject(new Error('Stuck in connector.'));
        }, config_1.config.PORTAL_TIMEOUT);
        waitForSpawn(bot)
            .then(() => {
            return delay(3000);
        })
            .then(() => {
            return bot.client.navigate.promise.to(startPos);
        })
            .then(() => {
            return delay(2000);
        })
            .then(() => {
            bot.client.lookAt(vec3_1.default(1, 0, 1), true);
            bot.client.setControlState('sprint', true);
            bot.client.setControlState('jump', true);
            bot.client.setControlState('forward', true);
            return delay(200);
        })
            .then(() => {
            bot.client.setControlState('jump', false);
            return delay(300);
        })
            .then(() => {
            bot.client.clearControlStates();
            return delay(2000);
        })
            .then(() => {
            return bot.client.navigate.to(portalFrontPos);
        })
            .then(() => {
            return delay(2000);
        })
            .then(() => {
            bot.client.lookAt(portalPos, true);
            bot.client.setControlState('sprint', true);
            bot.client.setControlState('jump', true);
            bot.client.setControlState('forward', true);
            bot.client.once('spawn', () => {
                bot.client.clearControlStates();
                clearTimeout(portalTimeout);
                resolve();
            });
        })
            .catch(() => {
            reject(new Error('Stuck in connector.'));
        });
        bot.client.chat('/portal');
    });
}
exports.connectCityBuildTask = run;
