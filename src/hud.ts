import type {GameState} from 'src';

// Draw the game's HUD.
// Takes the GameState to read the score.
// Takes the deltaTime, but this is unused.
// Takes the context for drawing.
export default function hud(game_state: GameState, _delta: number, ctx: CanvasRenderingContext2D) {
	ctx.fillStyle = 'rgba(0,0,0,128)';
	// Draw boxes for text
	ctx.fillRect(0, 0, ctx.canvas.width, 36);
	ctx.fillRect(0, ctx.canvas.height - 34, ctx.canvas.width, 64);
	// Draw title
	ctx.strokeStyle = 'white';
	ctx.fillStyle = 'white';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.font = '32px Major Mono Display';
	ctx.fillText('snek', ctx.canvas.width / 2, 15);
	// Draw DEMO text
	if (game_state.settings.autoMode && ((Math.round(game_state.clock / 100) % 2) === 0 || !game_state.settings.flashy)) {
		ctx.textAlign = 'left';
		ctx.fillText('demo', 10, 15);
	}

	// Draw a score display.
	// TODO: This should be written to read from players' scores instead of the unused global score.
	ctx.textAlign = 'left';
	ctx.textBaseline = 'bottom';
	ctx.font = '16px Major Mono Display';
	ctx.fillText(`score ${game_state.score}`, 10, ctx.canvas.height - 10);
}
