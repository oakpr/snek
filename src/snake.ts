import type {GameState} from 'src';

export default function snake(ctx: CanvasRenderingContext2D, gameState: GameState, delta: number) {
	// TODO
	// Iterate over all players and run their snake ticks
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

	constructor() {
		// Set the tail to an empty array so it is initialized next frame
		this.tail = [];
		this.score = 0;
		// Set the facing to an uninit so it can be informed by the random start position
		this.facing = Facing.Uninit;
		this.dying = false;
	}

	// Return the snake's speed as a number seconds per cell.
	speed() {
		// Placeholder thing
		return 1 / this.tail.length;
	}

	// Tick the snake. If its timer exceeds speed(), reset it to zero and move().
	// Also, initialize the snake at a random position facing the center, if it looks uninitialized.
	tick(gameState: GameState, ctx: CanvasRenderingContext2D, delta: number) {
		// TODO
	}

	// Move the snake one tile, in the direction it's facing.
	// If wrapping is disabled and the snake is past the edge, kill it.
	// If wrapping is enabled and the snake is past the edge, wrap.
	// If this snake's head intersects with another snake, kill it.
	move(gameState: GameState) {
		// TODO
	}
}
