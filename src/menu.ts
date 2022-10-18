import type {GameState} from 'src';
import {GameMode} from './game-mode.js';

// The types of all settings values.
export type Settings = {
	// Whether to draw the background.
	flashy: boolean;
	// Whether the snake will wrap when hitting the edge instead of dying.
	wrap: boolean;
	// The dimensions of the grid.
	gridWidth: number;
	gridHeight: number;
	// Draw various debug information.
	testDisplay: boolean;
	// Limit the frame rate to the user's monitor.
	waitForFrame: boolean;
	// Display the average frame rate.
	showFrameRate: boolean;
	// Whether to enable dynamic music
	music: boolean;
	// Whether to play automatically
	autoMode: boolean;
	// Whether to move as fast as possible
	fast: boolean;
};
export const defaultSettings = {
	flashy: true,
	wrap: false,
	gridWidth: 10,
	gridHeight: 10,
	testDisplay: false,
	waitForFrame: true,
	showFrameRate: false,
	music: true,
	autoMode: false,
	fast: false,
};

// The list of options to display in the menu.
// Options with one string are labels and do nothing.
// Options with three values are settings. The first value is a label,
// the second is the setting key, and the third are the possible values.
const options: Array<[string, string, any[]] | [string]> = [
	['snek menu'],
	['flashy?', 'flashy', [true, false]],
	['wrap?', 'wrap', [true, false]],
	['width?', 'gridWidth', [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]],
	['height?', 'gridHeight', [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]],
	['test mode?', 'testDisplay', [false, true]],
	['frame limit?', 'waitForFrame', [true, false]],
	['frame display?', 'showFrameRate', [false, true]],
	['music?', 'music', [true, false]],
	['demo?', 'autoMode', [false, true]],
	['fast?', 'fast', [false, true]],
	['press a to start'],
];

// The position of the cursor in the menu.
let cursorPos = 1;

// Whether to ignore inputs on a given axis because we already heard from them last frame.
let suppressY = false;
let suppressX = false;

// Draw the menu.
// eslint-disable-next-line complexity
export default function menu(ctx: CanvasRenderingContext2D, gameState: GameState) {
	// Draw the background.
	ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
	ctx.fillRect(32, 64, ctx.canvas.width - 64, ctx.canvas.height - 128);

	// Draw the entries.
	const entryRange = Math.round((ctx.canvas.height - 128) / 128);
	const entrySpacing = 48;
	for (let i = -entryRange; i < entryRange + 1; i++) {
		const index = cursorPos + i;
		if (index < 0 || index >= options.length) {
			continue;
		}

		const x = ctx.canvas.width / 2;
		const y = (ctx.canvas.height / 2) + (entrySpacing * i);
		const width = ctx.canvas.width - 128;
		ctx.strokeStyle = 'white';
		ctx.fillStyle = 'white';
		ctx.font = i === 0 ? '32px Major Mono Display' : '24px Major Mono Display';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		if (options[index][2]?.length > 0) {
			ctx.fillText(`${i === 0 ? '< ' : ''}${options[index][0]}: ${(Object.hasOwn(gameState.settings, options[index][1]) ? gameState.settings[options[index][1]] : options[index][2][0]) as string}${i === 0 ? ' >' : ''}`, x, y, width);
		} else {
			ctx.fillText(options[index][0], x, y, width);
		}
	}

	// Get the information of the current entry.
	const key = options[cursorPos][1];
	const values = options[cursorPos][2] || false;

	// Run entry switching.
	if (Math.abs(gameState.players[0]?.movement[1]) > 0.7) {
		if (!suppressY) {
			const delta = Math.round(gameState.players[0].movement[1]);
			cursorPos += delta;
			cursorPos %= options.length;
			if (cursorPos < 0) {
				cursorPos += options.length;
			}

			suppressY = true;

			return;
		}
	} else {
		suppressY = false;
	}

	// Run value switching.
	if (Math.abs(gameState.players[0]?.movement[0]) > 0.9) {
		if (values && values.length > 0 && !suppressX) {
			let currentSetting = values.includes(gameState.settings[key]) ? values.indexOf(gameState.settings[key]) : 0;
			const delta = Math.round(gameState.players[0].movement[0]);
			currentSetting += delta;
			currentSetting %= values.length;
			if (currentSetting < 0) {
				currentSetting += values.length;
			}

			suppressX = true;

			// Set the field to the new value
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			gameState.settings[key] = values[currentSetting];
		}
	} else {
		suppressX = false;
	}

	// If the player's button is pressed, advance to the game
	if (gameState.players[0]?.buttons[0] && gameState.players[0]?.buttonsDirty[0]) {
		gameState.gameMode = GameMode.Game;
	}
}
