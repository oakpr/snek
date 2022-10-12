import {background} from './background.js';
import type {Fruit} from './fruit.js';
import fruit from './fruit.js';
import grid, {cellPositionHelper, cellSizeHelper} from './grid.js';
import hud from './hud.js';
import type {Player} from './input.js';
import * as input from './input.js';
import type {Settings} from './menu.js';
import menu, {defaultSettings} from './menu.js';
import music from './music.js';
import type {Snake} from './snake.js';
import snake from './snake.js';

// The entire state of the game.
// Game steps should not store their state internally; that is bad practice.
export type GameState = {
	// The number of milliseconds since the start of the game.
	clock: number;
	// Unused, should be removed.
	// Players' scores are stored individually.
	score: number;
	// The list of players.
	// A player is undefined after they have left.
	players: Array<Player | undefined>;
	// The game's settings, as defined by the player in the main menu.
	settings: Settings;
	// Whether the game has started.
	// If this is false, we're in the menu.
	gameStarted: boolean;
	// The list of all fruits
	fruits: Fruit[];
};

// The time of the last tick.
let lastTick = Date.now();

// The default game state is initialized here.
const gameState: GameState = {
	// Players will be populated as the game receives input.
	players: [],
	clock: 0,
	score: 0,
	// Sets default settings as defined in menu.ts
	settings: defaultSettings,
	// The game starts on the menu.
	// TODO: Rewrite this as an enum for extra "dead" or "victory" states.
	gameStarted: false,
	// The game starts with no fruits.
	fruits: [],
};

// A persistent reference to the game's canvas element.
const canvas: HTMLCanvasElement = document.querySelector('#viewport');
// The rendering context used to draw the game.
const ctx = canvas.getContext('2d');

// A rotating buffer of recent frame intervals.
// Only updates when the frame rate display is enabled.
const frameTimeHistory: number[] = [];

// Start background loop.
// This is done outside of the main loop for performance reasons.
background(gameState);

// Start music loop.
// This is done outside of the main loop because it doesn't have to run in lockstep with gameplay.
music(gameState);

// The entry point for the main loop.
function tick() {
	// Wipe the screen, with either transparency or gray, depending on the settings.
	if (gameState.settings.enableBg && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	} else {
		ctx.fillStyle = 'rgb(32, 32, 32)';
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	}

	// Tick player input
	input.tickPlayerInput(gameState);

	// Get delta time
	const delta = Date.now() - lastTick;
	lastTick = Date.now();
	gameState.clock += delta;

	// Draw grid
	grid(ctx, gameState);

	if (gameState.gameStarted) {
		// Tick snakes
		snake(ctx, gameState, delta);
		// Uncomment to enable Willow's fruit implementation
		// // Tick fruits
		// fruit(gameState, ctx);
	} else {
		// Draw the pre-game menu
		menu(ctx, gameState);
	}

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

	// Draw the frame-rate counter, if it's enabled.
	if (gameState.settings.showFrameRate) {
		// Push the latest frame timing to the buffer.
		frameTimeHistory.push(delta);
		// Trim the buffer down to size.
		while (frameTimeHistory.length > 60) {
			frameTimeHistory.shift();
		}

		// Sum the frame times.
		let avg = 0;
		for (const time of frameTimeHistory) {
			avg += time;
		}

		// Divide the sum to get the mean.
		avg /= frameTimeHistory.length;
		// Convert from milliseconds per frame to frames per second.
		avg = 1000 / avg;
		// Draw the frame rate display.
		ctx.lineWidth = 1;
		ctx.strokeStyle = 'white';
		ctx.font = '16px Major Mono Display';
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';
		ctx.strokeText(`fps: ${avg.toPrecision(3)}`, 10, 10);
	}

	// Wait for the next frame if frame limit is enabled, otherwise immediately run again.
	if (gameState.settings.waitForFrame) {
		window.requestAnimationFrame(tick);
	} else {
		setTimeout(tick, 0);
	}
}

tick();
