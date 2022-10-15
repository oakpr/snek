// Willow's fruit implementation.
// For educational purposes. Please write your own, you'll learn more that way

import type {GameState} from 'src';
import {BasicFruit} from './fruits/basic.js';
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

	// Passes through the return value from check, or a sensible default.
	tick(gameState: GameState): [number, number, boolean, Snake] | false {
		for (const snake of gameState.players.map(p => p.snake)) {
			if (snake.timer === 0) {
				// If a snake's timer is zero, it moved this frame!!!
				const result: any[] = this.check(gameState, snake);
				result.push(snake);
				return result as [number, number, boolean, Snake];
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

export const fruitKinds = [BasicFruit];

export default function fruit(gameState: GameState, ctx: CanvasRenderingContext2D) {
	for (let i = gameState.fruits.length - 1; i >= 0; i--) {
		const result = gameState.fruits[i].tick(gameState);
		if (!result) {
			continue;
		}

		const [scoreDelta, lengthDelta, disappear, snake] = result;
		gameState.fruits[i].tick(gameState);
		snake.score += scoreDelta * Math.max(1, snake.combo);
		snake.combo += scoreDelta / 2;
		snake.len += lengthDelta;
		snake.thickness += scoreDelta > 0 ? 0.2 : 0;
		if (disappear) {
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
