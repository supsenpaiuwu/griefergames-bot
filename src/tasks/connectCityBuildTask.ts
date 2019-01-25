import vec3 from 'vec3';
import { config } from '../config';

// Overly complicated code due to bad Mineflayer physics...

export function connectCityBuildTask(bot, portalPos, portalFrontPos): Promise<void> {
  return new Promise((resolve, reject) => {

    const portalTimeout = setTimeout(() => {
      reject(new Error('Stuck in connector.'));
    }, config.PORTAL_TIMEOUT);

    bot.client.once('spawn', () => {

      // Wait for portal cooldown to pass before starting
      setTimeout(() => {
        setup();
      }, config.PORTAL_COOLDOWN);

      // Walk to start position
      function setup() {
        const startPos = vec3(324, 117, 277);
        bot.client.navigate.once('arrived', () => {
          setTimeout(() => {
            jumpDown();
          }, 500);
        });
        bot.client.navigate.to(startPos);
      }

      // Jump down from the platform
      function jumpDown() {
        bot.client.lookAt(vec3(1, 0, 1), true);
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

      // Walk to the front of the portal
      function navigateToPortal() {
        bot.client.navigate.once('arrived', () => {
          setTimeout(() => {
            enterPortal();
          }, 1000);
        });
        bot.client.navigate.to(portalFrontPos);
      }

      // Jump into the portal
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
