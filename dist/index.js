import {background} from "./background.js";
import grid, {cellPositionHelper, cellSizeHelper} from "./grid.js";
import hud from "./hud.js";
import * as input from "./input.js";
import menu from "./menu.js";
import snake from "./snake.js";
let lastTick = Date.now();
const gameState = {
  players: [],
  clock: 0,
  score: 0,
  settings: {
    enableBg: true,
    wrap: false,
    gridWidth: 10,
    gridHeight: 10,
    testDisplay: false
  },
  gameStarted: false
};
const canvas = document.querySelector("#viewport");
const ctx = canvas.getContext("2d");
function tick() {
  input.tickPlayerInput();
  gameState.players = input.players;
  const delta = Date.now() - lastTick;
  lastTick = Date.now();
  gameState.clock += delta;
  background(gameState, ctx);
  grid(ctx, gameState);
  if (gameState.gameStarted) {
  } else {
    menu(ctx, gameState);
  }
  snake(ctx, gameState, delta);
  hud(gameState, delta, ctx);
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
  window.requestAnimationFrame(tick);
}
tick();
