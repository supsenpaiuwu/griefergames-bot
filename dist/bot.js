"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mineflayer_1 = __importDefault(require("mineflayer"));
const mineflayer_navigate_promise_1 = __importDefault(require("mineflayer-navigate-promise"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const events_1 = require("events");
const sessionHandler_1 = require("./sessionHandler");
const enums_1 = require("./enums");
const config_1 = require("./config");
const connector_1 = require("./tasks/connector");
const minecraftUtil_1 = require("./util/minecraftUtil");
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
            this.clean();
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
    async connectCityBuild(destination) {
        const dest = destination.trim().toLowerCase();
        let connectorOptions;
        try {
            connectorOptions = await this.loadConnectorOptions(dest);
        }
        catch (e) {
            throw new Error(`Could not load options for given CityBuild ('${dest}').`);
        }
        try {
            await connector_1.connectorTask(this, connectorOptions);
        }
        catch (e) {
            throw e;
        }
    }
    sendChat(text, sendNext) {
        return this.send(text, sendNext);
    }
    sendCommand(command, sendNext) {
        return this.send(`/${command}`, sendNext);
    }
    sendMsg(re, text, sendNext) {
        return this.send(`/msg ${re} ${text}`, sendNext);
    }
    pay(re, amount, sendNext) {
        return this.send(`/pay ${re} ${amount}`, sendNext);
    }
    navigateTo(position) {
        return this.client.navigate.promise.to(position);
    }
    end(reason) {
        if (this.client) {
            this.client.quit(reason);
            this.client.removeAllListeners();
        }
        this.removeAllListeners();
    }
    async loadConnectorOptions(dest) {
        const file = path_1.default.join(__dirname, `../paths/${dest.trim().toLowerCase()}.json`);
        let connectorOptions;
        try {
            connectorOptions = await readJsonFile(file);
        }
        catch (e) {
            throw e;
        }
        return connectorOptions;
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
        this.client.chatAddPattern(config_1.config.CHATMODE_ALERT_REGEXP, 'chatModeAlert');
        this.client.chatAddPattern(config_1.config.SLOWCHAT_ALERT_REGEXP, 'slowChatAlert');
        this.client.chatAddPattern(config_1.config.COMMANDSPAM_ALERT_REGEXP, 'commandSpamAlert');
        this.client.on('msg', (rank, username, message) => {
            this.emit('msg', rank, username, message);
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
            console.warn('Sent messages too quickly!');
        });
        this.client.on('commandSpamAlert', () => {
            this.chatDelay = config_1.config.SLOW_COOLDOWN;
            console.warn('Sent commands too quickly!');
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
        this.client.on('message', (message) => {
            if (this.options.logMessages) {
                console.log(message.toAnsi());
            }
            const codedText = minecraftUtil_1.jsonToCodedText(message.json).trim();
            const text = minecraftUtil_1.stripCodes(codedText);
            const payMatches = codedText.match(config_1.config.PAY_REGEXP);
            if (payMatches) {
                const rank = payMatches[1];
                const username = payMatches[2];
                const amount = parseFloat(payMatches[3].replace(/,/g, ''));
                this.emit('pay', rank, username, amount, text, codedText);
            }
        });
        this.client._client.on('packet', (data, metadata) => {
            if (metadata.name === 'scoreboard_team' && data.name === 'Kontostandcheck') {
                this.emit('scoreboardBalance', data.prefix);
            }
        });
    }
    getTimeSinceLastMessage() {
        return Date.now() - this.messageLastSentTime;
    }
    processChatQueue() {
        if (this.chatQueue.length === 0) {
            return;
        }
        const [text, resolve] = this.chatQueue.shift();
        this.client.chat(text);
        this.messageLastSentTime = Date.now();
        resolve();
        if (text.startsWith('/')) {
            if (this.currentChatMode === enums_1.ChatMode.NORMAL) {
                this.chatDelay = config_1.config.NORMAL_COOLDOWN;
            }
            else {
                this.chatDelay = config_1.config.SLOW_COOLDOWN;
            }
        }
        else {
            if (this.currentChatMode === enums_1.ChatMode.NORMAL) {
                this.chatDelay = config_1.config.NORMAL_COOLDOWN + 1000;
            }
            else {
                this.chatDelay = config_1.config.SLOW_COOLDOWN + 1000;
            }
        }
        if (this.options.additionalChatDelay) {
            this.chatDelay += this.options.additionalChatDelay;
        }
        if (this.chatQueue.length > 0) {
            setTimeout(() => {
                this.processChatQueue();
            }, this.chatDelay);
        }
    }
    async send(text, sendNext) {
        if (this.chatQueue.length > 0) {
            if (sendNext) {
                return this.sendNext(text);
            }
            return this.addToQueue(text);
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
        return this.addToQueue(text);
    }
    addToQueue(text) {
        return new Promise(resolve => {
            this.chatQueue.push([text, resolve]);
        });
    }
    sendNext(text) {
        return new Promise(resolve => {
            this.chatQueue = [[text, resolve], ...this.chatQueue];
        });
    }
    clean(reason) {
        if (this.client) {
            this.client.quit(reason);
            this.client.removeAllListeners();
            this.client = null;
        }
    }
}
exports.Bot = Bot;
function readJsonFile(filePath) {
    return new Promise((resolve, reject) => {
        fs_1.default.readFile(filePath, 'utf8', (e, data) => {
            if (e) {
                reject(e);
                return;
            }
            let parsed;
            try {
                parsed = JSON.parse(data);
            }
            catch (e) {
                reject(e);
                return;
            }
            resolve(parsed);
        });
    });
}
function createBot(options) {
    const bot = new Bot(options);
    return bot;
}
exports.createBot = createBot;
//# sourceMappingURL=bot.js.map