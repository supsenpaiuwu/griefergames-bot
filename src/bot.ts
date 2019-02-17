import mineflayer from 'mineflayer';
import navigatePlugin from 'mineflayer-navigate-promise';
import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

import { getValidSession } from './sessionHandler';
import { Session, Options, ConnectorOptions } from './interfaces';
import { ChatMode } from './enums';
import { config } from './config';
import { connectorTask } from './tasks/connector';
import { jsonToCodedText, stripCodes } from './util/minecraftUtil';

class Bot extends EventEmitter {
  public client: any;
  private options: Options;
  private username: string;
  private password: string;
  private chatQueue: string[] = [];
  private currentChatMode = ChatMode.NORMAL;
  private chatDelay = config.NORMAL_COOLDOWN;
  private messageLastSentTime: number = 0;

  constructor(options: Options) {
    super();
    this.options = options;
    this.username = options.username;
    this.password = options.password;
    if (options.cacheSessions) {
      console.log('Caching sessions.');
    }
  }

  public async init(): Promise<void> {
    if (this.client) {
      return;
    }

    const botOptions: any = {
      host: 'bungee10.griefergames.net',
      port: null,
      version: 1.8,
      checkTimeoutInterval: 30000,
    };

    if (this.options.cacheSessions) {
      try {
        botOptions.session = await getValidSession(this.username, this.password);
      } catch (e) {
        throw e;
      }
    } else {
      botOptions.username = this.username;
      botOptions.password = this.password;
    }

    this.client = mineflayer.createBot(botOptions);

    this.registerEvents();
    this.installPlugins();
  }

  public async connectCityBuild(destination: string): Promise<void> {
    const dest = destination.trim().toLowerCase();

    let connectorOptions: ConnectorOptions;
    try {
      connectorOptions = await this.loadConnectorOptions(dest);
    } catch (e) {
      throw new Error(`Could not load options for given CityBuild ('${dest}').`);
    }

    try {
      await connectorTask(this, connectorOptions);
    } catch (e) {
      throw e;
    }
  }

  public sendChat(text: string, sendNext?: boolean): void {
    this.send(text, sendNext);
  }

  public sendCommand(command: string, sendNext?: boolean): void {
    this.send(`/${command}`, sendNext);
  }

  public sendMsg(re: string, text: string, sendNext?: boolean): void {
    this.send(`/msg ${re} ${text}`, sendNext);
  }

  public pay(re: string, amount: number, sendNext?: boolean): void {
    this.send(`/pay ${re} ${amount}`, sendNext);
  }

  public navigateTo(position: any): Promise<void> {
    return this.client.navigate.promise.to(position);
  }

  private async loadConnectorOptions(dest: string): Promise<ConnectorOptions> {
    const file = path.join(__dirname, `../paths/${dest.trim().toLowerCase()}.json`);

    let connectorOptions: ConnectorOptions;
    try {
      connectorOptions = await readJsonFile(file);
    } catch (e) {
      throw e;
    }

    return connectorOptions;
  }

  private installPlugins(): void {
    navigatePlugin(mineflayer)(this.client);
    this.client.navigate.blocksToAvoid[44] = true;
    this.client.navigate.blocksToAvoid[156] = true;
    this.client.navigate.blocksToAvoid[171] = true;
  }

  private registerEvents(): void {
    const forward = (e: any) => {
      this.client.on(e, (...d: any[]) => {
        this.emit(e, ...d);
      });
    };

    forward('spawn');
    forward('login');
    forward('kicked');
    forward('death');
    forward('end');

    this.client.chatAddPattern(config.MSG_REGEXP, 'msg');
    this.client.chatAddPattern(config.CHATMODE_ALERT_REGEXP, 'chatModeAlert');
    this.client.chatAddPattern(config.SLOWCHAT_ALERT_REGEXP, 'slowChatAlert');
    this.client.chatAddPattern(config.COMMANDSPAM_ALERT_REGEXP, 'commandSpamAlert');

    this.client.on('msg', (rank: string, username: string, message: string) => {
      this.emit('msg', rank, username, message);
    });

    this.client.on('chatModeAlert', (rank: string, username: string, change: string) => {
      switch (change) {
        case 'auf normal gestellt':
          this.currentChatMode = ChatMode.NORMAL;
          this.chatDelay = config.NORMAL_COOLDOWN;
          break;

        case 'verlangsamt':
          this.currentChatMode = ChatMode.SLOW;
          this.chatDelay = config.SLOW_COOLDOWN;
          break;

        case 'geleert':
          // TODO: maybe emit an event here
          break;
      }
      this.emit('chatModeAlert', rank, username, change);
    });

    this.client.on('slowChatAlert', () => {
      // Sent messages too quickly.
      // This can usually happen only
      // shortly after connecting.
      this.chatDelay = config.SLOW_COOLDOWN;
      this.sendChat('&f', true);
      console.warn('Sent messages too quickly!');
    });

    this.client.on('commandSpamAlert', () => {
      // Sent commands too quickly.
      // This can usually happen only
      // shortly after connecting.
      this.chatDelay = config.SLOW_COOLDOWN;
      console.warn('Sent commands too quickly!');
    });

    this.client.on('connect', () => {
      this.client.once('spawn', () => {
        // Ready once fully connected
        // and spawned in hub.
        this.emit('ready');
      });
    });

    this.client._client.once('session', () => {
      const session: Session = this.client._client.session;

      this.emit('session', session);
    });

    this.client.on('error', (e: any) => {
      const errorText: string = (e.message || '').toLowerCase();

      // Absorb deserialization and buffer errors.
      if (errorText.includes('deserialization') || errorText.includes('buffer')) {
        return;
      }

      this.emit('error', e);
    });

    this.client.on('message', (message: any) => {
      if (this.options.logMessages) {
        console.log(message.toAnsi());
      }

      // Convert JSON chat to a coded string...
      // Trim just to be safe with our RegExp.
      const codedText = jsonToCodedText(message.json).trim();
      const text = stripCodes(codedText);

      const payMatches = codedText.match(config.PAY_REGEXP);
      if (payMatches) {
        // Received money.
        const rank = payMatches[1];
        const username = payMatches[2];
        const amount = parseFloat(payMatches[3].replace(/,/g, ''));
        this.emit('pay', rank, username, amount, text, codedText);
      }
    });
  }

  private getTimeSinceLastMessage(): number {
    return Date.now() - this.messageLastSentTime;
  }

  private processChatQueue(): void {
    if (this.chatQueue.length === 0) {
      return;
    }

    const text = this.chatQueue.shift() || '';

    // Determine cooldown until next message.
    if (text.startsWith('/')) {
      if (this.currentChatMode === ChatMode.NORMAL) {
        this.chatDelay = config.NORMAL_COOLDOWN;
      } else {
        this.chatDelay = config.SLOW_COOLDOWN;
      }
    } else {
      // Wait longer when sending regular chat messages.
      this.chatDelay = config.SLOW_COOLDOWN + 1000;
    }

    this.client.chat(text);
    this.messageLastSentTime = Date.now();

    if (this.chatQueue.length > 0) {
      setTimeout(() => {
        this.processChatQueue();
      }, this.chatDelay);
    }
  }

  private send(text: string, sendNext?: boolean): void {
    if (this.chatQueue.length > 0) {
      if (sendNext) {
        this.chatQueue.unshift(text);
        return;
      }

      this.chatQueue.push(text);
      return;
    }

    // From here on it only gets executed if the queue is empty.
    const sinceLast = this.getTimeSinceLastMessage();

    // If this is true, the message can be sent safely.
    if (sinceLast >= this.chatDelay) {
      this.client.chat(text);
      this.messageLastSentTime = Date.now();
      return;
    }

    const untilNext = this.chatDelay - sinceLast;

    // Process the queue after the amount of time has passed.
    setTimeout(() => {
      this.processChatQueue();
    }, untilNext);

    // Finally, add the message to the queue.
    this.chatQueue.push(text);
  }
}

function readJsonFile(filePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (e, data) => {
      if (e) {
        reject(e);
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch (e) {
        reject(e);
        return;
      }

      resolve(parsed);
    });
  });
}

function createBot(options: Options): Bot {
  const bot = new Bot(options);
  return bot;
}

export {
  createBot,
  Bot,
};
