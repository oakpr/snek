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
	len: number;
	score: number;
	facing: Facing;
	dying: boolean;
	timer: number;
	player: number;

	constructor(player: number) {
		// Set the tail to an empty array so it is initialized next frame
		this.tail = [];
		this.len = 4;
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
		return 1000 / this.len;
	}

	// Tick the snake. Increase the timer by delta. If its timer exceeds speed(), reset it to zero and move().
	// Also, initialize the snake at a random position facing the center, if it looks uninitialized.
	// eslint-disable-next-line complexity
	tick(gameState: GameState, ctx: CanvasRenderingContext2D, delta: number) {
		if (!gameState.gameStarted) {
			return;
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

		this.timer += delta;
		if (this.timer > this.speed()) {
			this.move(gameState);
			this.timer = 0;
		}

		// Draw the snake
		ctx.strokeStyle = 'white';
		const w = cellSizeHelper(ctx, gameState);
		ctx.lineWidth = w * 0.8;
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		ctx.beginPath();
		if (this.tail.length > 1) {
			const headPos = cellPositionHelper(ctx, gameState, this.tail[0], w);
			let nextPos = cellPositionHelper(ctx, gameState, this.tail[1], w);
			const animHeadPos = interPos(nextPos, headPos, this.timer / this.speed());
			ctx.moveTo(animHeadPos[0], animHeadPos[1]);
			if (distance(this.tail[1], this.tail[0]) === 1) {
				ctx.lineTo(animHeadPos[0], animHeadPos[1]);
				ctx.lineTo(nextPos[0], nextPos[1]);
			} else {
				ctx.moveTo(headPos[0], headPos[1]);
				ctx.lineTo(headPos[0], headPos[1]);
			}

			let lastPos = nextPos;
			for (const position of this.tail.slice(1, -1)) {
				const pos = cellPositionHelper(ctx, gameState, position, w);
				if (distance(lastPos, position) === 1) {
					ctx.lineTo(pos[0], pos[1]);
				} else {
					ctx.moveTo(pos[0], pos[1]);
					ctx.lineTo(pos[0], pos[1]);
				}

				lastPos = position;
			}

			const tailPos = cellPositionHelper(ctx, gameState, this.tail[this.tail.length - 1], w);
			nextPos = cellPositionHelper(ctx, gameState, this.tail[this.tail.length - 2], w);
			if (distance(this.tail[this.tail.length - 1], this.tail[this.tail.length - 2]) === 1) {
				if (this.tail.length < this.len) {
					ctx.lineTo(nextPos[0], nextPos[1]);
					ctx.lineTo(tailPos[0], tailPos[1]);
				} else {
					const animTailPos = interPos(tailPos, nextPos, this.timer / this.speed());
					ctx.lineTo(nextPos[0], nextPos[1]);
					ctx.lineTo(animTailPos[0], animTailPos[1]);
				}
			} else {
				ctx.moveTo(tailPos[0], tailPos[1]);
				ctx.lineTo(tailPos[0], tailPos[1]);
			}
		} else {
			const headPos = cellPositionHelper(ctx, gameState, this.tail[0], w);
			ctx.moveTo(headPos[0], headPos[1]);
			ctx.lineTo(headPos[0], headPos[1]);
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

		// Wrap the head around the edges if wrapping is allowed
		if (gameState.settings.wrap) {
			const w = gameState.settings.gridWidth;
			const h = gameState.settings.gridHeight;
			if (head[0] < 0) {
				head[0] = w - 1;
			} else if (head[0] >= w) {
				head[0] = 0;
			}

			if (head[1] < 0) {
				head[1] = h - 1;
			} else if (head[1] >= h) {
				head[1] = 0;
			}
		} else {
			// Kill the snake if wrapping is not allowed and the head has passed the edges
		}

		this.tail.unshift(head);
		while (this.tail.length > this.len) {
			this.tail.pop();
		}
	}
}

function addPos(a: [number, number], b: [number, number]): [number, number] {
	return [a[0] + b[0], a[1] + b[1]];
}

function interPos(a: [number, number], b: [number, number], c: number) {
	const delta: [number, number] = [(b[0] - a[0]) * c, (b[1] - a[1]) * c];
	return addPos(a, delta);
}

function distance(a: [number, number], b: [number, number]): number {
	return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}
