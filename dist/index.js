import {background} from "./background.js";
import fruit from "./fruit.js";
import grid, {cellPositionHelper, cellSizeHelper} from "./grid.js";
import hud from "./hud.js";
import * as input from "./input.js";
import menu, {defaultSettings} from "./menu.js";
import music from "./music.js";
import snake from "./snake.js";
import {GameMode} from "./game-mode.js";
import warning from "./warning.js";
import hiScore from "./hiscore.js";
let lastTick = Date.now();
export const defaultGameState = {
  players: [],
  clock: 0,
  score: 0,
  highScore: 0,
  settings: defaultSettings,
  gameMode: GameMode.Warning,
  fruits: [],
  name: void 0
};
const gameState = {...defaultGameState};
const canvas = document.querySelector("#viewport");
const ctx = canvas.getContext("2d");
const frameTimeHistory = [];
background(gameState);
music(gameState);
function tick() {
  if (gameState.settings.flashy && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  } else {
    ctx.fillStyle = "rgb(32, 32, 32)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  input.tickPlayerInput(gameState);
  const delta = Date.now() - lastTick;
  lastTick = Date.now();
  gameState.clock += delta;
  grid(ctx, gameState);
  if (gameState.gameMode === GameMode.Game) {
    snake(ctx, gameState, delta);
    fruit(gameState, ctx);
  } else {
    switch (gameState.gameMode) {
      case GameMode.Menu:
        menu(ctx, gameState);
        break;
      case GameMode.Warning:
        warning(ctx, gameState);
        break;
      case GameMode.UploadScore:
        hiScore(gameState, ctx);
        break;
      default:
        alert("UNIMPLEMENTED GAMEMODE");
    }
  }
  hud(gameState, delta, ctx);
  gameState.highScore = Math.max(gameState.highScore, gameState.score);
  if (gameState.settings.testDisplay) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const start = cellPositionHelper(ctx, gameState, [0, 0], cellSizeHelper(ctx, gameState));
    ctx.moveTo(start[0], start[1]);
    for (let x = 0; x < gameState.settings.gridWidth; x++) {
      for (let y = 0; y < gameState.settings.gridHeight; y++) {
        const p = cellPositionHelper(ctx, gameState, [x, y], cellSizeHelper(ctx, gameState));
        ctx.lineTo(p[0], p[1]);
      }
    }
    ctx.stroke();
  }
  if (gameState.settings.showFrameRate) {
    frameTimeHistory.push(delta);
    while (frameTimeHistory.length > 60) {
      frameTimeHistory.shift();
    }
    let avg = 0;
    for (const time of frameTimeHistory) {
      avg += time;
    }
    avg /= frameTimeHistory.length;
    avg = 1e3 / avg;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "white";
    ctx.font = "16px Major Mono Display";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.strokeText(`fps: ${avg.toPrecision(3)}`, 10, 10);
  }
  if (gameState.settings.waitForFrame) {
    window.requestAnimationFrame(tick);
  } else {
    setTimeout(tick, 0);
  }
}
tick();
