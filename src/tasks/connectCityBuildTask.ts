import vec3 from 'vec3';
import { config } from '../config';

// Overly complicated code due to bad Mineflayer physics...

function delay(amount): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, amount);
  });
}

function waitForSpawn(bot): Promise<void> {
  return new Promise(resolve => {
    bot.client.once('spawn', () => {
      resolve();
    });
  });
}

const startPos = vec3(324, 117, 277);

function run(bot, portalPos, portalFrontPos): Promise<void> {
  return new Promise((resolve, reject) => {

    const portalTimeout = setTimeout(() => {
      reject(new Error('Stuck in connector.'));
    }, config.PORTAL_TIMEOUT);

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
      bot.client.lookAt(vec3(1, 0, 1), true);
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
      return waitForSpawn(bot);
    })
    .then(() => {
      bot.client.clearControlStates();
      clearTimeout(portalTimeout);
      resolve();
    })
    .catch(() => {
      reject(new Error('Stuck in connector.'));
    });
    bot.client.chat('/portal');

  });
}

export { run as connectCityBuildTask };
