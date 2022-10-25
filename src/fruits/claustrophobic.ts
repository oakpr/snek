import type {GameState} from '../index.js';
import type {Snake} from '../snake.js';
import snake from '../snake.js';
import {cellPositionHelper, cellSizeHelper, distance} from '../grid.js';
import type {FruitOutput} from './base.js';
import {Fruit} from './base.js';

export class ClaustrophobicFruit extends Fruit {
	static roll(gameState: GameState): boolean {
		if (gameState.fruits.some(fruit => fruit instanceof ClaustrophobicFruit)) {
			return false;
		}

		const snakeLength = gameState.players.map(player => player.snake).map(snake => snake.len).reduce((previous, curr, _index) => previous + curr, 0);
		const size = gameState.settings.gridHeight * gameState.settings.gridWidth;
		const snakeBoardFrac = snakeLength / size;

		if (snakeBoardFrac > 0.4) {
			return false;
		}

		return true;
	}

	static spawn(gameState: GameState) {
		let x: number;
		let y: number;
		let attempts = 0;
		do {
			x = Math.floor(1 + (Math.random() * (gameState.settings.gridWidth - 2)));
			y = Math.floor(1 + (Math.random() * (gameState.settings.gridHeight - 2)));
			attempts += 1;
			if (attempts > 2) {
				return;
			}
		// eslint-disable-next-line @typescript-eslint/no-loop-func
		} while (gameState.players.some(player => player.snake.intersects([x, y])) || gameState.players.some(player => new ClaustrophobicFruit([x, y]).check(gameState, player.snake).disappear));

		gameState.fruits.push(new ClaustrophobicFruit([x, y]));
	}

	position: [number, number];

	constructor(position: [number, number]) {
		super();
		this.position = position;
	}

	check(gameState: GameState, snake: Snake): FruitOutput {
		const head = snake.tail[0];

		// Check whether the snake has eaten the fruit normally
		if (head[0] === this.position[0] && head[1] === this.position[1]) {
			return {
				scoreDelta: 1,
				lenDelta: 1,
				disappear: true,
				snake: undefined,
			};
		}

		// Init sets for the path check
		const occupied = new Set<number>();
		const visited = new Set<number>();
		const queue = new Array<[number, number]>();

		function pos2int(pos: [number, number]): number {
			return pos[0] + (gameState.settings.gridWidth * pos[1]);
		}

		// Populate the 'occupied' set
		for (const snake of gameState.players.map(player => player.snake)) {
			for (const pos of snake.tail) {
				occupied.add(pos2int(pos));
			}
		}

		// Seed the path check with the current position
		queue.push(this.position);
		while (queue.length > 0) {
			// Pop a position to check from the end of the queue
			const p = queue.pop();

			// If the position is a border, stop and exit.
			if (p[0] === 0 || p[0] === gameState.settings.gridWidth - 1 || p[1] === 0 || p[1] === gameState.settings.gridHeight - 1) {
				return {
					scoreDelta: 0,
					lenDelta: 0,
					disappear: false,
					snake: undefined,
				};
			}

			// Mark the cell as "visited"
			visited.add(pos2int(p));

			// Get all of the cardinal neighbors of this cell
			let toAdd = new Array<[number, number]>();
			for (let x = -1; x < 2; x += 2) {
				toAdd.push([p[0] + x, p[1]]);
			}

			for (let y = -1; y < 2; y += 2) {
				toAdd.push([p[0], p[1] + y]);
			}

			// Filter to only tiles not already visited or occupied by a snake.
			toAdd = toAdd.filter(pos => !(occupied.has(pos2int(pos)) || visited.has(pos2int(pos))));

			// Add all of the neighbor cells to the queue.
			for (const cell of toAdd) {
				queue.push(cell);
			}
		}

		// Default case, if we made it this far the fruit is surrounded.
		return {
			scoreDelta: 3,
			lenDelta: 0,
			disappear: true,
			snake,
		};
	}

	draw(gameState: GameState, ctx: CanvasRenderingContext2D): void {
		const cellSize = cellSizeHelper(ctx, gameState);
		const scrPos = cellPositionHelper(ctx, gameState, this.position, cellSize);
		const playerHeads = gameState.players.map(player => player.snake.tail[0]);
		let shortestDistance = 99_999;
		let shortest: [number, number];
		for (const head of playerHeads) {
			const dist = distance(head, this.position);
			if (dist < shortestDistance) {
				shortestDistance = dist;
				shortest = head;
			}
		}

		// Draw the eye.
		ctx.beginPath();
		ctx.fillStyle = 'white';
		ctx.ellipse(scrPos[0], scrPos[1], cellSize * 0.4, cellSize * 0.4, 0, 0, 360);
		ctx.fill();

		// Draw the pupil of the eye.
		ctx.beginPath();
		ctx.fillStyle = 'black';
		const angle = Math.atan2(this.position[1] - shortest[1], this.position[0] - shortest[0]) + Math.PI;
		const offset = cellSize * 0.3;
		const x = scrPos[0] + (offset * Math.cos(angle));
		const y = scrPos[1] + (offset * Math.sin(angle));
		ctx.ellipse(x, y, cellSize * 0.2, cellSize * 0.2, 0, 0, 360);
		ctx.fill();
	}
}
