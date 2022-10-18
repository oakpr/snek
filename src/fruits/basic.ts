import {cellPositionHelper, cellSizeHelper} from '../grid.js';
import type {Snake} from '../snake';
import type {GameState} from '../index';
import {Fruit} from './base.js';
import type {FruitOutput} from './base';

export class BasicFruit extends Fruit {
	static roll(gameState: GameState): boolean {
		const counter = gameState.fruits.filter(v => v instanceof BasicFruit).length;
		return counter < 2;
	}

	static spawn(gameState: GameState) {
		let x: number;
		let y: number;
		let attempts = 0;
		do {
			x = Math.floor((Math.random() * (gameState.settings.gridWidth)));
			y = Math.floor((Math.random() * (gameState.settings.gridHeight)));
			attempts += 1;
			if (attempts > 2) {
				return;
			}
		// eslint-disable-next-line @typescript-eslint/no-loop-func
		} while (gameState.players.some(player => player.snake.intersects([x, y])));

		gameState.fruits.push(new BasicFruit([x, y]));
	}

	position: [number, number];

	constructor(position: [number, number]) {
		super();
		this.position = position;
	}

	check(gameState: GameState, snake: Snake): FruitOutput {
		const head = snake.tail[0];
		if (head[0] === this.position[0] && head[1] === this.position[1]) {
			return {
				scoreDelta: 1,
				lenDelta: 1,
				disappear: true,
				snake: undefined,
			};
		}

		return {
			scoreDelta: 0,
			lenDelta: 0,
			disappear: false,
			snake: undefined,
		};
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
