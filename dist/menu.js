import {chooseCategory} from "./category.js";
import {GameMode} from "./game-mode.js";
export const defaultSettings = {
  flashy: true,
  wrap: false,
  gridWidth: 10,
  gridHeight: 10,
  testDisplay: false,
  waitForFrame: true,
  showFrameRate: false,
  music: true,
  autoMode: false,
  fast: false
};
const options = [
  ["snek menu"],
  ["flashy?", "flashy", [true, false]],
  ["wrap?", "wrap", [true, false]],
  ["width?", "gridWidth", [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]],
  ["height?", "gridHeight", [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]],
  ["test mode?", "testDisplay", [false, true]],
  ["frame limit?", "waitForFrame", [true, false]],
  ["frame display?", "showFrameRate", [false, true]],
  ["music?", "music", [true, false]],
  ["demo?", "autoMode", [false, true]],
  ["fast?", "fast", [false, true]],
  ["press a to start"]
];
let cursorPos = 1;
let suppressY = false;
let suppressX = false;
export default function menu(ctx, gameState) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(32, 64, ctx.canvas.width - 64, ctx.canvas.height - 64);
  ctx.font = "16px Major Mono Display";
  ctx.strokeStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeText(chooseCategory(gameState.settings), ctx.canvas.width / 2, ctx.canvas.height - 56, ctx.canvas.width - 128);
  const entryRange = Math.round((ctx.canvas.height - 128) / 128);
  const entrySpacing = 48;
  for (let i = -entryRange; i < entryRange + 1; i++) {
    const index = cursorPos + i;
    if (index < 0 || index >= options.length) {
      continue;
    }
    const x = ctx.canvas.width / 2;
    const y = ctx.canvas.height / 2 + entrySpacing * i;
    const width = ctx.canvas.width - 128;
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.font = i === 0 ? "32px Major Mono Display" : "24px Major Mono Display";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (options[index][2]?.length > 0) {
      ctx.fillText(`${i === 0 ? "< " : ""}${options[index][0]}: ${Object.hasOwn(gameState.settings, options[index][1]) ? gameState.settings[options[index][1]] : options[index][2][0]}${i === 0 ? " >" : ""}`, x, y, width);
    } else {
      ctx.fillText(options[index][0], x, y, width);
    }
  }
  const key = options[cursorPos][1];
  const values = options[cursorPos][2] || false;
  if (Math.abs(gameState.players[0]?.movement[1]) > 0.7) {
    if (!suppressY) {
      const delta = Math.round(gameState.players[0].movement[1]);
      cursorPos += delta;
      cursorPos %= options.length;
      if (cursorPos < 0) {
        cursorPos += options.length;
      }
      suppressY = true;
      return;
    }
  } else {
    suppressY = false;
  }
  if (Math.abs(gameState.players[0]?.movement[0]) > 0.9) {
    if (values && values.length > 0 && !suppressX) {
      let currentSetting = values.includes(gameState.settings[key]) ? values.indexOf(gameState.settings[key]) : 0;
      const delta = Math.round(gameState.players[0].movement[0]);
      currentSetting += delta;
      currentSetting %= values.length;
      if (currentSetting < 0) {
        currentSetting += values.length;
      }
      suppressX = true;
      gameState.settings[key] = values[currentSetting];
    }
  } else {
    suppressX = false;
  }
  if (gameState.players[0]?.buttons[0] && gameState.players[0]?.buttonsDirty[0]) {
    gameState.gameMode = GameMode.Game;
  }
}
