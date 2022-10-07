import type {GameState} from 'src';
import {cellSizeHelper, cellPositionHelper} from './grid.js';

export default function snake(ctx: CanvasRenderingContext2D, gameState: GameState, delta: number) {
	// Iterate over all players and run their snake ticks
	for (const player of gameState.players) {
		if (player === undefined) {
			continue;
		}

		player.snake.tick(gameState, ctx, delta);
	}
}

enum Facing {
	Uninit,
	Up,
	Right,
	Down,
	Left,
}

export class Snake {
	tail: Array<[number, number]>;
	score: number;
	facing: Facing;
	dying: boolean;
	timer: number;
	player: number;

	constructor(player: number) {
		// Set the tail to an empty array so it is initialized next frame
		this.tail = [];
		this.score = 0;
		// Set the facing to an uninit so it can be informed by the random start position
		this.facing = Facing.Uninit;
		this.dying = false;
		this.player = player;
		this.timer = 0;
	}

	// Return the snake's speed as a number of seconds per cell.
	speed() {
		// Placeholder thing
		return 1000 / this.tail.length;
	}

	// Tick the snake. Increase the timer by delta. If its timer exceeds speed(), reset it to zero and move().
	// Also, initialize the snake at a random position facing the center, if it looks uninitialized.
	tick(gameState: GameState, ctx: CanvasRenderingContext2D, delta: number) {
		if (!gameState.gameStarted) {
			return;
		}

		const player = gameState.players.find(v => v.controllerId === this.player);
		const x: number = player.movement[0];
		const y: number = player.movement[1];
		let f = this.facing;
		if (x > 0) {
			f = Facing.Right;
		}

		if (x < 0) {
			f = Facing.Left;
		}

		if (y < 0) {
			f = Facing.Up;
		}

		if (y > 0) {
			f = Facing.Down;
		}

		let badDirection: Facing;
		switch (this.facing) {
			case Facing.Up: {
				badDirection = Facing.Down;
				break;
			}

			case Facing.Down: {
				badDirection = Facing.Up;
				break;
			}

			case Facing.Left: {
				badDirection = Facing.Right;
				break;
			}

			case Facing.Right: {
				badDirection = Facing.Left;
				break;
			}

			default: {
				badDirection = Facing.Uninit;
			}
		}

		if (f !== badDirection) {
			this.facing = f;
		}

		if (this.facing === Facing.Uninit) {
			const x = Math.floor(Math.random() * gameState.settings.gridWidth);
			const y = Math.floor(Math.random() * gameState.settings.gridHeight);
			const cx = gameState.settings.gridWidth / 2;
			const cy = gameState.settings.gridHeight / 2;
			if (Math.abs(cx - x) > Math.abs(cy - y)) {
				this.facing = x > cx ? Facing.Left : Facing.Right;
			} else if (y > cy) {
				this.facing = Facing.Up;
			} else {
				this.facing = Facing.Down;
			}

			this.tail.push([x, y]);
		}

		this.timer += delta;
		if (this.timer > this.speed()) {
			this.move(gameState);
			this.timer = 0;
		}

		// Draw the snake
		ctx.strokeStyle = 'white';
		ctx.lineWidth = cellSizeHelper(ctx, gameState) * 0.8;
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		ctx.beginPath();
		const headPos = cellPositionHelper(ctx, gameState, this.tail[0], ctx.lineWidth);
		ctx.moveTo(headPos[0], headPos[1]);
		ctx.lineTo(headPos[0], headPos[1]);
		for (const position of this.tail) {
			const pos = cellPositionHelper(ctx, gameState, position, ctx.lineWidth);
			ctx.lineTo(pos[0], pos[1]);
		}

		ctx.stroke();
	}

	// Move the snake one tile, in the direction it's facing.
	// If wrapping is disabled and the snake is past the edge, kill it.
	// If wrapping is enabled and the snake is past the edge, wrap.
	// If this snake's head intersects with another snake, kill it.
	move(gameState: GameState) {
		let head = this.tail[0];
		switch (this.facing) {
			case Facing.Up: {
				head = addPos(head, [0, -1]);
				break;
			}

			case Facing.Down: {
				head = addPos(head, [0, 1]);
				break;
			}

			case Facing.Right: {
				head = addPos(head, [1, 0]);
				break;
			}

			case Facing.Left: {
				head = addPos(head, [-1, 0]);
				break;
			}

			default: {
				break;
			}
		}

		this.tail.unshift(head);
		this.tail.pop();
	}
}

function addPos(a: [number, number], b: [number, number]): [number, number] {
	return [a[0] + b[0], a[1] + b[1]];
}
