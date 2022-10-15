import type {GameState} from 'src';
import {Fruit} from 'src/fruit';
import {cellPositionHelper, cellSizeHelper} from 'src/grid';
import type {Snake} from 'src/snake';

export class BasicFruit extends Fruit {
	static roll(gameState: GameState): boolean {
		const counter = gameState.fruits.filter(v => v instanceof BasicFruit).length;
		return counter < 2;
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
