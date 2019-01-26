import { EventEmitter } from 'events';
import mineflayer from 'mineflayer';
import navigatePlugin from 'mineflayer-navigate';
import vec3 from 'vec3';

import { ChatMode } from './enums';
import { config } from './config';
import { connectCityBuildTask } from './tasks/connectCityBuildTask';
import { Session, Options } from './interfaces';
import * as sessionHandler from './sessionHandler';

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

  // Call this method to start the bot.
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
        botOptions.session = await sessionHandler.getValidSession(this.username, this.password);
      } catch (e) {
        throw e;
      }
    } else {
      botOptions.username = this.username;
      botOptions.password = this.options.password;
    }

    this.client = mineflayer.createBot(botOptions);

    this.registerEvents();
    this.installPlugins();
  }

  public connectCityBuild(destination: string): Promise<void> {
    let portalPos: any;
    let portalFrontPos: any;
    switch (destination.trim().toLowerCase()) {
      case 'cb1':
        portalPos = vec3(312, 117, 271);
        portalFrontPos = vec3(314, 116, 273);
        break;
      case 'cb2':
        portalPos = vec3(317, 117, 271);
        portalFrontPos = vec3(319, 116, 273);
        break;
      case 'extreme':
        portalPos = vec3(306, 117, 286);
        portalFrontPos = vec3(308, 116, 287);
        break;
      default:
        return Promise.reject(new Error(`Not implemented yet ("${destination}").`));
    }
    return connectCityBuildTask(this, portalPos, portalFrontPos);
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

  private installPlugins(): void {
    navigatePlugin(mineflayer)(this.client);
    this.client.navigate.blocksToAvoid[171] = true;
    this.client.navigate.blocksToAvoid[44] = true;
  }

  private registerEvents(): void {
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

    this.client.chatAddPattern(config.MSG_REGEXP, 'msg');
    this.client.chatAddPattern(config.PAY_REGEXP, 'pay');
    this.client.chatAddPattern(config.CHATMODE_ALERT_REGEXP, 'chatModeAlert');
    this.client.chatAddPattern(config.SLOWCHAT_ALERT_REGEXP, 'slowChatAlert');

    this.client.on('msg', (rank: string, username: string, message: string) => {
      this.emit('msg', rank, username, message);
    });

    this.client.on('pay', (rank: string, username: string, amount: string) => {
      const parsedAmount = parseInt(amount.replace(/,/g, ''), 10);
      this.emit('pay', rank, username, parsedAmount);
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
      this.chatDelay = config.SLOW_COOLDOWN;
      this.sendChat('&f', true);

      this.emit('slowChatAlert');
    });

    this.client.on('connect', () => {
      this.client.once('spawn', () => {
        this.emit('ready');
      });
    });

    this.client._client.once('session', () => {
      const session: Session = {
        accessToken: this.client._client.session.accessToken,
        clientToken: this.client._client.session.clientToken,
        selectedProfile: {
          id: this.client._client.session.selectedProfile.id,
          name: this.client._client.session.selectedProfile.name,
        }
      };

      this.emit('session', session);
    });

    this.client.on('error', (e) => {
      const errorText: string = (e.message || '').toLowerCase();

      // Absorb deserialization and buffer errors.
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

  private getTimeSinceLastMessage(): number {
    return Date.now() - this.messageLastSentTime;
  }

  private processChatQueue(): void {
    if (this.chatQueue.length === 0) {
      return;
    }

    const text = this.chatQueue.shift();

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

export function createBot(options: Options): Bot {
  const bot = new Bot(options);
  return bot;
}
