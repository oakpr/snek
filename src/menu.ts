import type {GameState} from 'src';

const options: Array<[string, string, any[]] | [string]> = [
	['snek menu'],
	['enable bg?', 'enable_bg', [true, false]],
	['wrap?', 'wrap', [true, false]],
	['press a to start'],

];
let cursorPos = 1;

let suppressY = false;
let suppressX = false;

export default function menu(ctx: CanvasRenderingContext2D, gameState: GameState) {
	ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
	ctx.fillRect(32, 64, ctx.canvas.width - 64, ctx.canvas.height - 128);
	for (let i = -2; i < 3; i++) {
		const index = cursorPos + i;
		if (index < 0 || index >= options.length) {
			continue;
		}

		const x = ctx.canvas.width / 2;
		const y = (ctx.canvas.height / 2) + (64 * i);
		const width = ctx.canvas.width - 128;
		ctx.strokeStyle = 'white';
		ctx.fillStyle = 'white';
		ctx.font = i === 0 ? '32px Major Mono Display' : '24px Major Mono Display';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		if (options[index][2]?.length > 0) {
			ctx.fillText(`${i === 0 ? '< ' : ''}${options[index][0]}: ${(gameState.settings.has(options[index][1]) ? gameState.settings.get(options[index][1]) : options[index][2][0]) as string}${i === 0 ? ' >' : ''}`, x, y, width);
		} else {
			ctx.fillText(options[index][0], x, y, width);
		}
	}

	const key = options[cursorPos][1];
	const values = options[cursorPos][2] || false;

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

	if (Math.abs(gameState.players[0]?.movement[0]) > 0.9) {
		if (values && values.length > 0 && !suppressX) {
			let currentSetting = values.includes(gameState.settings.get(key)) ? values.indexOf(gameState.settings.get(key)) : 0;
			const delta = Math.round(gameState.players[0].movement[0]);
			currentSetting += delta;
			currentSetting %= values.length;
			if (currentSetting < 0) {
				currentSetting += values.length;
			}

			suppressX = true;

			// Set the field to the new value
			gameState.settings.set(key, values[currentSetting]);
		}
	} else {
		suppressX = false;
	}

	// If the player's button is pressed, advance to the game
	if (gameState.players[0]?.buttons[0]) {
		gameState.gameStarted = true;
	}
}
