// Willow's fruit implementation.
// For educational purposes. Please write your own, you'll learn more that way

import type {GameState} from 'src';
import {cellPositionHelper, cellSizeHelper} from './grid.js';
import type {Snake} from './snake';

// Base class for all Fruit that does nothing.
export class Fruit {
	// Roll whether to spawn the fruit?
	static roll(gameState: GameState): boolean {
		return false;
	}

	// Add the fruit to the GameState
	static spawn(gameState: GameState) {
		// Does nothing, since this is just a marker class.
	}

	// Returns whether the fruit should disappear.
	tick(gameState: GameState): boolean {
		for (const snake of gameState.players.map(p => p.snake)) {
			if (snake.timer === 0) {
				// If a snake's timer is zero, it moved this frame!!!
				const result = this.check(gameState, snake);
				snake.score += result[0];
				snake.len += result[1];
				return result[2];
			}
		}

		return false;
	}

	// Draws the fruit.
	draw(gameState: GameState, ctx: CanvasRenderingContext2D) {
		// Does nothing, since this is just a marker class.
	}

	// Checks whether the fruit has been eaten!
	// Returns the delta to the player's score,
	// the delta to the player's length,
	// and whether the fruit should disappear...
	check(gameState: GameState, snake: Snake): [number, number, boolean] {
		return [0, 0, false];
	}
}

export class BasicFruit extends Fruit {
	static roll(gameState: GameState): boolean {
		return gameState.fruits.findIndex(v => v instanceof BasicFruit) === -1;
	}

	static spawn(gameState: GameState) {
		const x = Math.floor(Math.random() * gameState.settings.gridWidth);
		const y = Math.floor(Math.random() * gameState.settings.gridHeight);
		gameState.fruits.push(new BasicFruit([x, y]));
	}

	position: [number, number];

	constructor(position: [number, number]) {
		super();
		this.position = position;
	}

	check(gameState: GameState, snake: Snake): [number, number, boolean] {
		const head = snake.tail[0];
		if (head[0] === this.position[0] && head[1] === this.position[1]) {
			return [1, 1, true];
		}

		return [0, 0, false];
	}

	draw(gameState: GameState, ctx: CanvasRenderingContext2D): void {
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
}

export const fruitKinds = [BasicFruit];

export default function fruit(gameState: GameState, ctx: CanvasRenderingContext2D) {
	for (let i = gameState.fruits.length - 1; i >= 0; i--) {
		if (gameState.fruits[i].tick(gameState)) {
			gameState.fruits.splice(i, 1);
		}
	}

	for (const fruitKind of fruitKinds) {
		if (fruitKind.roll(gameState)) {
			fruitKind.spawn(gameState);
		}
	}

	for (const fruit of gameState.fruits) {
		fruit.draw(gameState, ctx);
	}
}
