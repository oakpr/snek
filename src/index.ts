import {background} from './background.js';
import hud from './hud.js';
import * as input from './input.js';

export type GameState = {
	clock: number;
	score: number;
};

let lastTick = Date.now();
const gameState: GameState = {
	clock: 0,
	score: 0,
};
const canvas: HTMLCanvasElement = document.querySelector('#viewport');
const ctx = canvas.getContext('2d');

function tick() {
	// Tick player input
	input.tickPlayerInput();

	// Get delta time
	const delta = Date.now() - lastTick;
	lastTick = Date.now();
	gameState.clock += delta;

	// Draw background
	background(gameState, ctx);

	// Draw HUD
	hud(gameState, delta, ctx);

	// Wait for a frame, then call me again.
	window.requestAnimationFrame(tick);
}

tick();
