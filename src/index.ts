import {background} from './background.js';
import hud from './hud.js';
import type {Player} from './input.js';
import * as input from './input.js';

export type GameState = {
	clock: number;
	score: number;
	players: Array<Player | undefined>;
};

let lastTick = Date.now();
const gameState: GameState = {
	players: [],
	clock: 0,
	score: 0,
};
const canvas: HTMLCanvasElement = document.querySelector('#viewport');
const ctx = canvas.getContext('2d');

function tick() {
	// Tick player input
	input.tickPlayerInput();
	gameState.players = input.players;

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
