import type {GameState} from 'src';
import { cellPositionHelper, cellSizeHelper } from './grid.js';

// Randomly populates fruit
let food: [number, number] | undefined;
// This should be able to vary for different types of fruit
const expansionRate = 1;

// If snake is on food, expand the snake
export function update(gameState: GameState) {
	if (!food) {
		food = getRandomFoodPosition(gameState);
	}

	// Tweaked to work with our data structures
	for (const snake of gameState.players.map(p => p.snake)) {
		if (snake.intersects(food)) {
			snake.len += expansionRate;
			food = getRandomFoodPosition(gameState);
		}
	}
}

export function draw(gameState: GameState, ctx: CanvasRenderingContext2D) {
	const scrPos = cellPositionHelper(ctx, gameState, this.position, cellSizeHelper(ctx, gameState));
		ctx.beginPath();
		ctx.moveTo(scrPos[0] - 10, scrPos[1]);
		ctx.lineTo(scrPos[0], scrPos[1] - 10);
		ctx.lineTo(scrPos[0] + 10, scrPos[1]);
		ctx.lineTo(scrPos[0], scrPos[1] + 10);
		ctx.lineTo(scrPos[0] - 10, scrPos[1]);
		ctx.fillStyle = 'white';
		ctx.fill();
}

function getRandomFoodPosition(gameState: GameState): [number, number] {
	// Rewrite to read our grid settings and use the snake.intersects method
	

	return [0, 0];
}
