import {background} from "./background.js";
import grid from "./grid.js";
import hud from "./hud.js";
import * as input from "./input.js";
import menu from "./menu.js";
let lastTick = Date.now();
const gameState = {
  players: [],
  clock: 0,
  score: 0,
  settings: {
    enableBg: true,
    wrap: false,
    gridWidth: 10,
    gridHeight: 10
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
  hud(gameState, delta, ctx);
  window.requestAnimationFrame(tick);
}
tick();
