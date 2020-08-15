"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.solveAfkChallengeTask = void 0;
async function run(bot, window) {
    const items = Object.entries(window.containerItems());
    const slot = items[0][1].slot;
    try {
        await waitForClickSlot(bot, slot);
        await waitForCloseWindow(bot);
    }
    catch (e) {
        throw e;
    }
    return true;
}
exports.solveAfkChallengeTask = run;
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
//# sourceMappingURL=solve-afk-challenge.js.map