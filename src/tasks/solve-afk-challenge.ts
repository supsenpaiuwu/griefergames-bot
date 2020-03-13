import { Bot } from '../bot';

async function run(bot: Bot, window: any) {
  const items = Object.entries(window.containerItems());
  const slot = items[0][1].slot;

  try {
    await waitForClickSlot(bot, slot);
    await waitForCloseWindow(bot);
  } catch (e) {
    throw e;
  }

  return true;
}

function waitForClickSlot(bot, slot) {
  return new Promise((resolve) => {
    bot.client.clickWindow(slot, 0, 0, resolve);
  });
}

function waitForCloseWindow(bot) {
  return new Promise((resolve) => {
    bot.client.once('windowClose', () => {
      resolve();
    });
  });
}

export { run as solveAfkChallengeTask };
