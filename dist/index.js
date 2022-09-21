import {background} from "./background.js";
import hud from "./hud.js";
import * as input from "./input.js";
let lastTick = Date.now();
const gameState = {
  clock: 0,
  score: 0
};
const canvas = document.querySelector("#viewport");
const ctx = canvas.getContext("2d");
function tick() {
  input.tickPlayerInput();
  const delta = Date.now() - lastTick;
  lastTick = Date.now();
  gameState.clock += delta;
  background(gameState, ctx);
  hud(gameState, delta, ctx);
  window.requestAnimationFrame(tick);
}
tick();
