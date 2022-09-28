import {background} from "./background.js";
import hud from "./hud.js";
import * as input from "./input.js";
import menu from "./menu.js";
let lastTick = Date.now();
const gameState = {
  players: [],
  clock: 0,
  score: 0,
  settings: new Map([
    ["enable_bg", true],
    ["wrap", false]
  ]),
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
  hud(gameState, delta, ctx);
  if (gameState.gameStarted) {
  } else {
    menu(ctx, gameState);
  }
  window.requestAnimationFrame(tick);
}
tick();
