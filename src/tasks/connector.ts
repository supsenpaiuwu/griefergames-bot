import vec3 from 'vec3';
import { Bot } from '../bot';
import { ConnectorOptions } from '../interfaces';
import { config } from '../config';

// An overwhelming amount of code
// due to bad Mineflayer physics.
// ¯\_(ツ)_/¯

// PS: Don't copy this without giving credits -
// this was a lot of work to optimize.
// Thank you!

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function waitForSpawn(bot: Bot): Promise<void> {
  return new Promise((resolve) => {
    bot.client.once('spawn', resolve);
  });
}

async function run(bot: Bot, options: ConnectorOptions): Promise<void> {
  const timeout = setTimeout(() => {
    throw new Error('Timed out while connecting on CityBuild.');
  }, config.PORTAL_TIMEOUT);

  bot.sendCommand('portal');
  await waitForSpawn(bot);
  await delay(3000);

  const [startX, startY, startZ] = options.start;
  const startPos = vec3(startX, startY, startZ);
  try {
    await bot.client.navigate.promise.to(startPos);
  } catch (e) {
    throw new Error('Stuck in connector.');
  }
  await delay(500);

  const [portalX, portalY, portalZ] = options.portal;
  const portalPos = vec3(portalX, portalY, portalZ);
  // bot.client.lookAt(portalPos, true);
  bot.client.setControlState('sprint', true);
  bot.client.setControlState('jump', true);
  bot.client.setControlState('forward', true);
  await delay(200);

  bot.client.setControlState('jump', false);
  await delay(300);

  bot.client.clearControlStates();
  await delay(2000);

  const [frontX, frontY, frontZ] = options.front;
  const frontPos = vec3(frontX, frontY, frontZ);
  try {
    await bot.client.navigate.promise.to(frontPos);
  } catch (e) {
    throw new Error('Stuck in connector.');
  }
  await delay(2000);

  bot.client.lookAt(portalPos, true);
  bot.client.setControlState('sprint', true);
  bot.client.setControlState('forward', true);
  bot.client.setControlState('jump', true);
  await waitForSpawn(bot);

  bot.client.clearControlStates();
  clearTimeout(timeout);
}

export { run as connectorTask };
