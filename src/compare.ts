import type {GameState} from 'src';
import {chooseCategory} from './category.js';
import {GameMode} from './game-mode.js';
import type {HiScoreData} from './hiscore';
import {hscoreCache} from './hiscore.js';
import type {Player} from './input.js';
import {defaultGameState} from './index.js';

export type Scores = Record<string, number>;

let scores: Scores | true | undefined;
const sortedScores: Array<[string, number, boolean]> = [];
let nowIndex = -1;

let cursor = 0;

export default function compareScores(gameState: GameState, ctx: CanvasRenderingContext2D) {
	const scoresCache = hscoreCache();

	if (!scoresCache || scores === true) {
		return;
	}

	if (scores === undefined) {
		scores = true;
		void refreshScores(scoresCache, chooseCategory(gameState.settings), gameState);
		return;
	}

	// Fill background
	ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	// Set text constraints
	const left = 64;
	const width = ctx.canvas.width - 128;
	const middle = ctx.canvas.height / 2;
	const size = 32;
	const range = ctx.canvas.height / (size * 3);
	ctx.strokeStyle = 'white';
	ctx.font = `${size}px Major Mono Display`;
	ctx.textAlign = 'left';
	ctx.textBaseline = 'middle';

	// Show all of the scores
	for (let i = -range; i <= range; i++) {
		const index = cursor + i;
		if (index < 0 || index >= sortedScores.length) {
			continue;
		}

		const yp = middle + (size * i);
		const [name, score, now] = sortedScores[index];
		const text = `${now ? '>' : (i === 0 ? '%' : ' ')}${name.toLowerCase()}: ${score} (#${index + 1})`;
		ctx.strokeText(text, left, yp, width);
	}

	// Process scrolling
	const controls: Player = gameState.players.find(Boolean);
	if (!controls) {
		return;
	}

	if (Math.abs(controls.movement[1]) < 0.7) {
		suppressY = false;
	}

	vscroll(gameState, controls);

	if (Math.abs(controls.movement[1]) > 0.7) {
		suppressY = true;
	}

	// Return to menu on A press
	if (controls.buttons[0] && controls.buttonsDirty[0]) {
		Object.assign(gameState, JSON.parse(JSON.stringify(defaultGameState)) as GameState);

		gameState.gameMode = GameMode.Menu;
	}
}

let suppressY = false;

async function refreshScores(data: HiScoreData | undefined, category: string, gameState: GameState) {
	scores = {};
	Object.assign(scores, JSON.parse(localStorage.getItem('scores') || '{}') as Scores);
	if (data) {
		const response = await fetch(data.server + '/snek%20' + encodeURIComponent(category) + '/board.json');
		const text = await response.text();
		const remote = JSON.parse(text) as Scores;
		for (const [name, score] of Object.entries(remote)) {
			if (!Object.hasOwn(scores, name) || scores[name] < score) {
				scores[name] = score;
			}
		}
	}

	let currentHi = false;
	for (const [name, score] of Object.entries(scores)) {
		const current = name === gameState.name && score === gameState.highScore;
		sortedScores.push([name, score, (current)]);
		currentHi = current || currentHi;
	}

	if (!currentHi) {
		sortedScores.push([gameState.name, gameState.score, true]);
	}

	sortedScores.sort((a, b) => b[1] - a[1]);

	// Find the index of our current score after the sort.
	nowIndex = sortedScores.findIndex(([_, __, b]) => b);
	cursor = nowIndex;
}

function vscroll(gameState: GameState, controls: Player) {
	if (Math.abs(controls.movement[1]) > 0.7 && !suppressY) {
		cursor += Math.sign(controls.movement[1]);
		if (cursor < 0) {
			cursor = sortedScores.length - 1;
		} else if (cursor >= sortedScores.length) {
			cursor = 0;
		}
	}
}
