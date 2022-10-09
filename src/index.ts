import {background} from './background.js';
import grid, {cellPositionHelper, cellSizeHelper} from './grid.js';
import hud from './hud.js';
import type {Player} from './input.js';
import * as input from './input.js';
import type {Settings} from './menu.js';
import menu, {defaultSettings} from './menu.js';
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
	settings: defaultSettings,
	gameStarted: false,
};
const canvas: HTMLCanvasElement = document.querySelector('#viewport');
const ctx = canvas.getContext('2d');

const frameTimeHistory: number[] = [];

// Run background loop
background(gameState);

function tick() {
	// Wipe screen
	if (gameState.settings.enableBg && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	} else {
		ctx.fillStyle = 'rgb(32, 32, 32)';
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	}

	// Tick player input
	input.tickPlayerInput();
	gameState.players = input.players;

	// Get delta time
	const delta = Date.now() - lastTick;
	lastTick = Date.now();
	gameState.clock += delta;

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

		avg = 1000 / avg;
		ctx.lineWidth = 1;
		ctx.strokeStyle = 'white';
		ctx.font = '16px Major Mono Display';
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';
		ctx.strokeText(`fps: ${avg.toPrecision(3)}`, 10, 10);
	}

	if (gameState.settings.waitForFrame) {
		// Wait for a frame, then call me again.
		window.requestAnimationFrame(tick);
	} else {
		setTimeout(tick, 0);
	}
}

tick();
