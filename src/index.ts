import {background} from './background.js';
import grid, {cellPositionHelper, cellSizeHelper} from './grid.js';
import hud from './hud.js';
import type {Player} from './input.js';
import * as input from './input.js';
import type {Settings} from './menu.js';
import menu from './menu.js';
import type {Snake} from './snake.js';
import snake from './snake.js';

export type GameState = {
	clock: number;
	score: number;
	players: Array<Player | undefined>;
	settings: Settings;
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
		testDisplay: false,
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

	// Draw grid
	grid(ctx, gameState);

	if (gameState.gameStarted) {
		// Do normal game things
	} else {
		// Draw the pre-game menu
		menu(ctx, gameState);
	}

	// Tick snakes
	snake(ctx, gameState, delta);

	// Draw HUD
	hud(gameState, delta, ctx);

	// Draw the grid test, if it's enabled.
	if (gameState.settings.testDisplay) {
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
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

	// Wait for a frame, then call me again.
	window.requestAnimationFrame(tick);
}

tick();
