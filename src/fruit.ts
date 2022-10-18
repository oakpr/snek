// Willow's fruit implementation.
// For educational purposes. Please write your own, you'll learn more that way

import type {GameState} from 'src';
import {BasicFruit} from './fruits/basic.js';
import {ClaustrophobicFruit} from './fruits/claustrophobic.js';

export const fruitKinds = [BasicFruit, ClaustrophobicFruit];

export default function fruit(gameState: GameState, ctx: CanvasRenderingContext2D) {
	for (let i = gameState.fruits.length - 1; i >= 0; i--) {
		const result = gameState.fruits[i].tick(gameState);
		gameState.fruits[i].tick(gameState);
		if (!result || !result.snake) {
			continue;
		}

		result.snake.score += result.scoreDelta * Math.max(1, result.snake.combo);
		result.snake.combo += result.scoreDelta / 2;
		result.snake.len += result.lenDelta;
		result.snake.thickness += result.scoreDelta > 0 ? 0.2 : 0;
		if (result.disappear) {
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
