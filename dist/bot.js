"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mineflayer_1 = __importDefault(require("mineflayer"));
const mineflayer_navigate_promise_1 = __importDefault(require("mineflayer-navigate-promise"));
const vec3_1 = __importDefault(require("vec3"));
const events_1 = require("events");
const connectCityBuildTask_1 = require("./tasks/connectCityBuildTask");
const sessionHandler_1 = require("./sessionHandler");
const enums_1 = require("./enums");
const config_1 = require("./config");
class Bot extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.chatQueue = [];
        this.currentChatMode = enums_1.ChatMode.NORMAL;
        this.chatDelay = config_1.config.NORMAL_COOLDOWN;
        this.messageLastSentTime = 0;
        this.options = options;
        this.username = options.username;
        this.password = options.password;
        if (options.cacheSessions) {
            console.log('Caching sessions.');
        }
    }
    async init() {
        if (this.client) {
            return;
        }
        const botOptions = {
            host: 'bungee10.griefergames.net',
            port: null,
            version: 1.8,
            checkTimeoutInterval: 30000,
        };
        if (this.options.cacheSessions) {
            try {
                botOptions.session = await sessionHandler_1.getValidSession(this.username, this.password);
            }
            catch (e) {
                throw e;
            }
        }
        else {
            botOptions.username = this.username;
            botOptions.password = this.password;
        }
        this.client = mineflayer_1.default.createBot(botOptions);
        this.registerEvents();
        this.installPlugins();
    }
    connectCityBuild(destination) {
        let portalPos;
        let portalFrontPos;
        switch (destination.trim().toLowerCase()) {
            case 'cb1':
                portalPos = vec3_1.default(312, 117, 271);
                portalFrontPos = vec3_1.default(314, 116, 273);
                break;
            case 'cb2':
                portalPos = vec3_1.default(317, 117, 271);
                portalFrontPos = vec3_1.default(319, 116, 273);
                break;
            case 'cb8':
                portalPos = vec3_1.default(332, 117, 289);
                portalFrontPos = vec3_1.default(330, 116, 287);
                break;
            case 'extreme':
                portalPos = vec3_1.default(306, 117, 286);
                portalFrontPos = vec3_1.default(308, 116, 287);
                break;
            default:
                return Promise.reject(new Error(`Not implemented yet ('${destination}').`));
        }
        return connectCityBuildTask_1.connectCityBuildTask(this, portalPos, portalFrontPos);
    }
    sendChat(text, sendNext) {
        this.send(text, sendNext);
    }
    sendCommand(command, sendNext) {
        this.send(`/${command}`, sendNext);
    }
    sendMsg(re, text, sendNext) {
        this.send(`/msg ${re} ${text}`, sendNext);
    }
    navigateTo(position) {
        return this.client.navigate.promise.to(position);
    }
    installPlugins() {
        mineflayer_navigate_promise_1.default(mineflayer_1.default)(this.client);
        this.client.navigate.blocksToAvoid[44] = true;
        this.client.navigate.blocksToAvoid[156] = true;
        this.client.navigate.blocksToAvoid[171] = true;
    }
    registerEvents() {
        const forward = (e) => {
            this.client.on(e, (...d) => {
                this.emit(e, ...d);
            });
        };
        forward('spawn');
        forward('login');
        forward('kicked');
        forward('death');
        forward('end');
        this.client.chatAddPattern(config_1.config.MSG_REGEXP, 'msg');
        this.client.chatAddPattern(config_1.config.PAY_REGEXP, 'pay');
        this.client.chatAddPattern(config_1.config.CHATMODE_ALERT_REGEXP, 'chatModeAlert');
        this.client.chatAddPattern(config_1.config.SLOWCHAT_ALERT_REGEXP, 'slowChatAlert');
        this.client.on('msg', (rank, username, message) => {
            this.emit('msg', rank, username, message);
        });
        this.client.on('pay', (rank, username, amount) => {
            const parsedAmount = parseInt(amount.replace(/,/g, ''), 10);
            this.emit('pay', rank, username, parsedAmount);
        });
        this.client.on('chatModeAlert', (rank, username, change) => {
            switch (change) {
                case 'auf normal gestellt':
                    this.currentChatMode = enums_1.ChatMode.NORMAL;
                    this.chatDelay = config_1.config.NORMAL_COOLDOWN;
                    break;
                case 'verlangsamt':
                    this.currentChatMode = enums_1.ChatMode.SLOW;
                    this.chatDelay = config_1.config.SLOW_COOLDOWN;
                    break;
                case 'geleert':
                    break;
            }
            this.emit('chatModeAlert', rank, username, change);
        });
        this.client.on('slowChatAlert', () => {
            this.chatDelay = config_1.config.SLOW_COOLDOWN;
            this.sendChat('&f', true);
            this.emit('slowChatAlert');
        });
        this.client.on('connect', () => {
            this.client.once('spawn', () => {
                this.emit('ready');
            });
        });
        this.client._client.once('session', () => {
            const session = this.client._client.session;
            this.emit('session', session);
        });
        this.client.on('error', (e) => {
            const errorText = (e.message || '').toLowerCase();
            if (errorText.includes('deserialization') || errorText.includes('buffer')) {
                return;
            }
            this.emit('error', e);
        });
        if (this.options.logMessages) {
            this.client.on('message', (message) => {
                console.log(message.toAnsi());
            });
        }
    }
    getTimeSinceLastMessage() {
        return Date.now() - this.messageLastSentTime;
    }
    processChatQueue() {
        if (this.chatQueue.length === 0) {
            return;
        }
        const text = this.chatQueue.shift();
        if (text.startsWith('/')) {
            if (this.currentChatMode === enums_1.ChatMode.NORMAL) {
                this.chatDelay = config_1.config.NORMAL_COOLDOWN;
            }
            else {
                this.chatDelay = config_1.config.SLOW_COOLDOWN;
            }
        }
        else {
            this.chatDelay = config_1.config.SLOW_COOLDOWN + 1000;
        }
        this.client.chat(text);
        this.messageLastSentTime = Date.now();
        if (this.chatQueue.length > 0) {
            setTimeout(() => {
                this.processChatQueue();
            }, this.chatDelay);
        }
    }
    send(text, sendNext) {
        if (this.chatQueue.length > 0) {
            if (sendNext) {
                this.chatQueue.unshift(text);
                return;
            }
            this.chatQueue.push(text);
            return;
        }
        const sinceLast = this.getTimeSinceLastMessage();
        if (sinceLast >= this.chatDelay) {
            this.client.chat(text);
            this.messageLastSentTime = Date.now();
            return;
        }
        const untilNext = this.chatDelay - sinceLast;
        setTimeout(() => {
            this.processChatQueue();
        }, untilNext);
        this.chatQueue.push(text);
    }
}
function createBot(options) {
    const bot = new Bot(options);
    return bot;
}
exports.createBot = createBot;
