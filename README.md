# griefergames

> Complaints:
> 0x13156E9@gmail.com

> A high-level package made for easily creating **bots** optimized for the Minecraft network **GrieferGames.net**.

Built upon [mineflayer](https://github.com/PrismarineJS/mineflayer).

Find this module on [npm](https://www.npmjs.com/package/griefergames).

[Twitter](https://twitter.com/derjp_) | 
[npm](https://www.npmjs.com/~derjp) | 
[Forums](https://griefergames.de/index.php?user/6076-derjp/)

## Features

* Promise support
* Expressive API (TypeScript support)
* Easily connect on every "CityBuild" server using a single method
* Optimized chat queue - adapts to chat mode and other factors
* Automatic session caching and refreshing
* Fake money filtering
* Useful events - react on private messages, money transfers etc
* Make use of the complete feature set of Mineflayer - this package only adds functionality
* Clean and focused

## Installation

This is a [Node.js](https://nodejs.org/) module available through the [npm registry](https://www.npmjs.com/).

Installation is done using the [`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install griefergames
```

## Quick Start

Importing the package:
```javascript
const gg = require('griefergames');

// or (using destructuring)
const { createBot } = require('griefergames');

// or (using ES6 import)
import { createBot } from 'griefergames';
```

Creating a bot:
```javascript
const bot = createBot({
  username: 'email@example.com',
  password: 'password',
  cacheSessions: true,
  logMessages: true
});

// This is async (returns a promise)
// We will ignore that for demonstration purposes.
bot.init();

bot.on('ready', function () {
  // You should wait for the 'ready' event
  // for most actions.
  console.log('Bot is now ready for use!');

  // For example, now would be a good time
  // to connect on our chosen "CityBuild" server.
  bot.connectCityBuild('cb2')
  .then(() => {
    console.log('Connected on CityBuild 2!');
    // Do things on the server...
  })
  .catch(e => {
    console.error(e);
  });
});
```

## Support

You will probably have some questions at some point of using this package.
Try to solve it by yourself first, by going through the code base (the TypeScript files give away most of the functionality of the package).
If you're stuck, don't hesitate to open a new issue directly on [GitHub](https://github.com/derjp/gg/issues) or contact me on the [GrieferGames forums](https://griefergames.de/index.php?user/6076-derjp/)!

## Roadmap

* Native proxy support
* Implement a more reliable "CityBuild" connection method (sending pre-recorded packets directly)
