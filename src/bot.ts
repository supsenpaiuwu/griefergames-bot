import mineflayer from 'mineflayer';
import navigatePlugin from 'mineflayer-navigate-promise';
import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

import { getValidSession } from './sessionHandler';
import { Session, Options, ConnectorOptions } from './interfaces';
import { ChatMode, ConnectionStatus, CityBuild } from './enums';
import { config } from './config';
import { connectorTask } from './tasks/connector';
import { jsonToCodedText, stripCodes } from './util/minecraftUtil';

class Bot extends EventEmitter {
  public client: any;
  public connectionStatus = ConnectionStatus.NOT_STARTED;
  private options: Options;
  private username: string;
  private password: string;
  private chatQueue = [];
  private currentChatMode = ChatMode.NORMAL;
  private chatDelay = config.NORMAL_COOLDOWN;
  private messageLastSentTime = 0;

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
  // It will also kill an existing bot if applicable.
  public async init(): Promise<void> {
    this.setConnectionStatus(ConnectionStatus.LOGGING_IN);

    this.clean();

    const botOptions: any = {
      host: 'bungee10.griefergames.net',
      port: null,
      version: 1.8, // TODO: Test if 1.12 is more stable.
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

  public isOnline(): boolean {
    return this.client && this.connectionStatus === ConnectionStatus.LOGGED_IN;
  }

  public getStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  public async connectCityBuild(dest: CityBuild): Promise<void> {
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

  public sendChat(text: string, sendNext?: boolean): Promise<void> {
    return this.send(text, sendNext);
  }

  public sendCommand(command: string, sendNext?: boolean): Promise<void> {
    return this.send(`/${command}`, sendNext);
  }

  public sendMsg(re: string, text: string, sendNext?: boolean): Promise<void> {
    return this.send(`/msg ${re} ${text}`, sendNext);
  }

  public pay(re: string, amount: number, sendNext?: boolean): Promise<void> {
    return this.send(`/pay ${re} ${amount}`, sendNext);
  }

  public navigateTo(position: any): Promise<void> {
    return this.client.navigate.promise.to(position);
  }

  public end(reason?: string): void {
    if (this.client) {
      this.client.quit(reason);
    }
  }

  private setConnectionStatus(status: ConnectionStatus): void {
    const old = this.connectionStatus;

    this.connectionStatus = status;

    this.emit('connectionStatus', status, old);
  }

  private async loadConnectorOptions(dest: CityBuild): Promise<ConnectorOptions> {
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
    forward('death');
    
    // Emitted when the client logs into the server.
    // The bot has not actually entered the world yet,
    // when login is called.
    this.client.on('login', () => {
      // Update connection status.
      this.setConnectionStatus(ConnectionStatus.LOGGED_IN);

      this.emit('login');
    });

    // Emitted when the client's connection to the server ends.
    this.client.on('end', () => {
      this.setConnectionStatus(ConnectionStatus.DISCONNECTED);

      this.emit('end');
    });

    // Emitted when the client is kicked.
    this.client.on('kicked', (reason: string, loggedIn: boolean) => {
      this.setConnectionStatus(ConnectionStatus.DISCONNECTED);

      let text;

      try {
        reason = JSON.parse(reason);
        text = stripCodes(reason.toString());
      } catch (e) {
        text = stripCodes(reason);
      }

      this.emit('kicked', text, loggedIn);
    });

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
      const errorText: string = (e.message || e || '').toLowerCase();

      // Absorb deserialization and buffer errors.
      if (errorText.includes('deserialization') || errorText.includes('buffer')) {
        return;
      }

      // This error not only occurs when credentials
      // are wrong, but also when you have been rate-limited.
      if (errorText.includes('invalid username or password')) {
        this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
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

    this.client._client.on('packet', (data: any, metadata: any) => {
      // Emit scoreboard balance updates.
      if (metadata.name === 'scoreboard_team' && data.name === 'Kontostandcheck') {
        this.emit('scoreboardBalance', data.prefix);
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

    const [text, resolve] = this.chatQueue.shift();

    this.client.chat(text);
    this.messageLastSentTime = Date.now();
    resolve();

    // Determine cooldown until next message.
    if (text.startsWith('/')) {
      if (this.currentChatMode === ChatMode.NORMAL) {
        this.chatDelay = config.NORMAL_COOLDOWN;
      } else {
        this.chatDelay = config.SLOW_COOLDOWN;
      }
    } else {
      // Wait longer when sending regular chat messages.
      if (this.currentChatMode === ChatMode.NORMAL) {
        this.chatDelay = config.NORMAL_COOLDOWN + 1000;
      } else {
        this.chatDelay = config.SLOW_COOLDOWN + 1000;
      }
    }

    // User wants to wait longer.
    // Sometimes this is needed, to make a quick fix
    // in case the bot is being kicked for "spamming" in chat.
    if (this.options.additionalChatDelay) {
      this.chatDelay += this.options.additionalChatDelay;
    }

    if (this.chatQueue.length > 0) {
      setTimeout(() => {
        this.processChatQueue();
      }, this.chatDelay);
    }
  }

  private async send(text: string, sendNext?: boolean): Promise<void> {
    // Makes sure the bot is truthy and
    // that its connectionStatus is logged in.
    if (!this.isOnline()) {
      throw new Error('Bot is not currently online.');
    }
    
    if (this.chatQueue.length > 0) {
      if (sendNext) {
        return this.sendNext(text);
      }

      return this.addToQueue(text);
    }

    // From here on it only gets executed if the queue is empty.
    const sinceLast = this.getTimeSinceLastMessage();

    // If this is true, the message can be sent safely.
    if (sinceLast >= this.chatDelay) {
      this.client.chat(text);
      this.messageLastSentTime = Date.now();
      return; // Resolves promise instantly.
    }

    const untilNext = this.chatDelay - sinceLast;

    // Process the queue after the amount of time has passed.
    setTimeout(() => {
      this.processChatQueue();
    }, untilNext);

    // Finally, add the message to the queue.
    return this.addToQueue(text);
  }

  private addToQueue(text: string): Promise<void> {
    return new Promise(resolve => {
      this.chatQueue.push([text, resolve]);
    });
  }

  private sendNext(text: string): Promise<void> {
    return new Promise(resolve => {
      // Place at the start of the array.
      this.chatQueue = [[text, resolve], ...this.chatQueue];
    });
  }

  private clean(reason?: string): void {
    if (this.client) {
      this.client.quit(reason);
      this.client.removeAllListeners();
      this.client = null;
    }
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
