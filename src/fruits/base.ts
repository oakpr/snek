import type {GameState} from 'src';
import type {Snake} from 'src/snake';

export type FruitOutput = {
	scoreDelta: number;
	lenDelta: number;
	disappear: boolean;
	snake: Snake | undefined;
};

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
	tick(gameState: GameState): FruitOutput | false {
		for (const snake of gameState.players.map(p => p.snake)) {
			if (snake.timer === 0) {
				// If a snake's timer is zero, it moved this frame!!!
				const result = this.check(gameState, snake);
				result.snake = snake;
				return result;
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
	check(gameState: GameState, snake: Snake): FruitOutput {
		return {
			scoreDelta: 0,
			lenDelta: 0,
			disappear: false,
			snake: undefined,
		};
	}
}
