import badWordsArray from 'naughty-words/en.json';
import {GameMode} from './game-mode.js';
import type {Player} from './input.js';
import {chooseCategory} from './category.js';
import type {GameState} from './index.js';
import {defaultGameState} from './index.js';

export type HiScoreData = {
	server: string;
	secret: string | false;
};

const letters: string[] = Array.from(Array.from({length: 26})).map((_, i) => i + 65).map(i => String.fromCodePoint(i));

// This will remain undefined if high score uploading is not configured for this server.
// High score uploading is only available on the arcade cabinet for security reasons.
let hiscore: HiScoreData | undefined;

const charLimit = 3;

// Stores the horizontal cursor.
let hcursor = 0;

// Holds the array of vertical cursors
const vcursors: number[] = Array.from({length: charLimit}).map(_ => 0);

// List of names that aren't allowed...
// Initialized once the list is fetched.
const badNames = new Set<string>(badWordsArray.filter(word => word.length === charLimit));

// Fetch high score info.
void fetch('./hiscore.json').then(response => {
	console.log('Finished requesting high score server data');
	console.log(response);
	void response.text().then((string_: string) => {
		console.log('Finished decoding high score server data');
		console.log(hiscore);
		hiscore = JSON.parse(string_) as HiScoreData;
	});
});

export default function hiScore(gameState: GameState, ctx: CanvasRenderingContext2D) {
	if (!hiscore) {
		gameState.gameMode = GameMode.Menu;
	}

	const controls: Player = gameState.players.find(Boolean);

	// Fill the gameState's name field.
	gameState.name = vcursors.map(v => letters[v]).join('');

	// Draw the interface.
	draw(ctx, gameState);

	if (!controls) {
		return;
	}

	// Clear suppress flags if the stick is centered.
	if (Math.abs(controls.movement[0]) < 0.7) {
		suppressX = false;
	}

	if (Math.abs(controls.movement[1]) < 0.7) {
		suppressY = false;
	}

	// Process scrolling.
	hscroll(gameState, controls);
	vscroll(gameState, controls);

	// Move to comparison/uploads if the player presses A
	if (controls.buttons[0] && controls.buttonsDirty[0] && !badNames.has(gameState.name.toLowerCase())) {
		gameState.gameMode = GameMode.CompareScore;

		upload(gameState);
	}

	// Restart the game if the player presses B
	if (controls.buttons[1] && controls.buttonsDirty[1]) {
		Object.assign(gameState, JSON.parse(JSON.stringify(defaultGameState)) as GameState);

		gameState.gameMode = GameMode.Menu;
	}

	// Set suppress flags if the stick is deflected.
	if (Math.abs(controls.movement[0]) > 0.7) {
		suppressX = true;
	}

	if (Math.abs(controls.movement[1]) > 0.7) {
		suppressY = true;
	}
}

let suppressY = false;
let suppressX = false;

function draw(ctx: CanvasRenderingContext2D, gameState: GameState) {
	const header = 'input name';
	const topLine = Array.from({length: charLimit}).map((_, i) => i === hcursor ? '⇧' : ' ').join(' ');
	const midLine = '⇦ ' + Array.from({length: charLimit}).map((_, i) => letters[vcursors[i]]).join(' ') + ' ⇨';
	const bottomLine = Array.from({length: charLimit}).map((_, i) => i === hcursor ? '⇩' : ' ').join(' ');
	const footer = badNames.has(gameState.name.toLowerCase()) ? 'no' : (hiscore?.secret ? 'a upload, b skip' : 'a compare, b skip');

	ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
	ctx.fillRect(96, (ctx.canvas.width / 2) - 128, ctx.canvas.width - (96 * 2), 256);

	ctx.font = '32px Major Mono Display';
	ctx.fillStyle = 'white';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	for (const [i, t] of [header, topLine, midLine, bottomLine, footer].entries()) {
		const line = i - 2;
		const y = (ctx.canvas.height / 2) + (48 * line);
		const x = ctx.canvas.width / 2;
		ctx.fillText(t.toLowerCase(), x, y, ctx.canvas.width - (128 * 2));
	}
}

function hscroll(gameState: GameState, controls: Player) {
	if (Math.abs(controls.movement[0]) > 0.7 && !suppressX) {
		hcursor += Math.sign(controls.movement[0]);
		if (hcursor < 0) {
			hcursor = charLimit - 1;
		} else if (hcursor >= charLimit) {
			hcursor = 0;
		}
	}
}

function vscroll(gameState: GameState, controls: Player) {
	if (Math.abs(controls.movement[1]) > 0.7 && !suppressY) {
		vcursors[hcursor] += Math.sign(controls.movement[1]);
		if (vcursors[hcursor] < 0) {
			vcursors[hcursor] = letters.length - 1;
		} else if (vcursors[hcursor] >= letters.length) {
			vcursors[hcursor] = 0;
		}
	}
}

function upload(gameState: GameState) {
	if (!hiscore.secret) {
		// If we don't have a secret, save locally instead
		const scores = JSON.parse(localStorage.getItem('scores') || '{}') as Record<string, number>;
		scores[gameState.name] = Math.max(scores[gameState.name] || 0, gameState.highScore);
		localStorage.setItem('scores', JSON.stringify(scores));
		return;
	}

	const url = (hiscore.server) + '/' + encodeURIComponent('snek ' + chooseCategory(gameState.settings)) + '/' + gameState.name + '/' + gameState.highScore.toString();
	const options = {
		method: 'POST',
		headers: {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Authorization: hiscore.secret,
		},
	};
	void fetch(url, options);
}

export function hscoreCache(): HiScoreData | undefined {
	return hiscore;
}
