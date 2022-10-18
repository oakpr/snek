import type {GameState} from 'src';
import {GameMode} from './game-mode.js';

export default function warning(ctx: CanvasRenderingContext2D, gameState: GameState) {
	if (gameState.players[0]?.buttonsDirty[0] && gameState.players[0]?.buttons[0]) {
		gameState.gameMode = GameMode.Menu;
		return;
	}

	if ((gameState.players[0]?.buttonsDirty[1] && gameState.players[0]?.buttons[1])) {
		gameState.settings.flashy = false;
		gameState.gameMode = GameMode.Menu;
	}

	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.font = '16px Major Mono Display';
	ctx.fillStyle = 'white';
	const text = `warning:
if flashy lights cause you discomfort
or present any kind of medical risk,
press the b button or the x key to start
the game with flashy effects disabled.
otherwise, press the a button or the z
key to begin.`;
	const lines = text.split('\n');
	const top = (ctx.canvas.height / 2) - (8 * lines.length);
	for (const [i, line] of lines.entries()) {
		ctx.fillText(line, ctx.canvas.width / 2, top + (16 * i));
	}
}
