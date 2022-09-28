import {background} from './background.js';
import hud from './hud.js';
import type {Player} from './input.js';
import * as input from './input.js';
import menu from './menu.js';

export type GameState = {
	clock: number;
	score: number;
	players: Array<Player | undefined>;
	settings: Record<string, any>;
	gameStarted: boolean;
};

let lastTick = Date.now();
const gameState: GameState = {
	players: [],
	clock: 0,
	score: 0,
	settings: {
		enableBg: true,
		wrap: false,
		gridWidth: 10,
		gridHeight: 10,
	},
	gameStarted: false,
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

	if (gameState.gameStarted) {
		// Do normal game things
	} else {
		// Draw the pre-game menu
		menu(ctx, gameState);
	}

	// Wait for a frame, then call me again.
	window.requestAnimationFrame(tick);
}

tick();
