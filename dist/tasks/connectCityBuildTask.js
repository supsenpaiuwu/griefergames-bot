"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vec3_1 = __importDefault(require("vec3"));
const config_1 = require("../config");
function connectCityBuildTask(bot, portalPos, portalFrontPos) {
    return new Promise((resolve, reject) => {
        const portalTimeout = setTimeout(() => {
            reject(new Error('Stuck in connector.'));
        }, config_1.config.PORTAL_TIMEOUT);
        bot.client.once('spawn', () => {
            setTimeout(() => {
                setup();
            }, config_1.config.PORTAL_COOLDOWN);
            function setup() {
                const startPos = vec3_1.default(324, 117, 277);
                bot.client.navigate.once('arrived', () => {
                    setTimeout(() => {
                        jumpDown();
                    }, 500);
                });
                bot.client.navigate.to(startPos);
            }
            function jumpDown() {
                bot.client.lookAt(vec3_1.default(1, 0, 1), true);
                bot.client.setControlState('sprint', true);
                bot.client.setControlState('jump', true);
                bot.client.setControlState('forward', true);
                setTimeout(() => {
                    bot.client.setControlState('jump', false);
                }, 200);
                setTimeout(() => {
                    bot.client.clearControlStates();
                    navigateToPortal();
                }, 500);
            }
            function navigateToPortal() {
                bot.client.navigate.once('arrived', () => {
                    setTimeout(() => {
                        enterPortal();
                    }, 1000);
                });
                bot.client.navigate.to(portalFrontPos);
            }
            function enterPortal() {
                bot.client.lookAt(portalPos, true);
                bot.client.setControlState('sprint', true);
                bot.client.setControlState('jump', true);
                bot.client.setControlState('forward', true);
                bot.client.once('spawn', () => {
                    bot.client.clearControlStates();
                    clearTimeout(portalTimeout);
                    resolve();
                });
            }
        });
        bot.client.chat('/portal');
    });
}
exports.connectCityBuildTask = connectCityBuildTask;
