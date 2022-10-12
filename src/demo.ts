import {Facing} from './snake.js';

export default function demo(size: [number, number], pos: [number, number], facing: Facing.Up | Facing.Right | Facing.Down | Facing.Left): Facing.Up | Facing.Right | Facing.Down | Facing.Left {
	if (size[1] % 2 === 0) {
		// The height is even, use the one-sided pattern.
		return auto1s(size, pos);
	}

	// The height is odd, use two-sided pattern.
	return auto2s(size, pos, facing);
}

function auto1s(size: [number, number], pos: [number, number]) {
	if (pos[0] === 0) {
		return (pos[1] === 0) ? Facing.Right : Facing.Up;
	}

	if (pos[0] === size[0] - 1) {
		return (pos[1] % 2 === 1) ? Facing.Left : Facing.Down;
	}

	if (pos[0] === 1 && pos[1] !== size[1] - 1) {
		return (pos[1] % 2 === 0) ? Facing.Right : Facing.Down;
	}

	return (pos[1] % 2 === 0) ? Facing.Right : Facing.Left;
}

// eslint-disable-next-line complexity
function auto2s(size: [number, number], pos: [number, number], facing: Facing.Up | Facing.Right | Facing.Down | Facing.Left) {
	if (pos[1] === 0 && facing === Facing.Up) {
		return pos[0] === size[0] - 1 ? Facing.Left : Facing.Right;
	}

	if (pos[0] === 0 || pos[0] === size[0] - 1) {
		return Facing.Up;
	}

	if (pos[1] === 0) {
		// Top row
		if (pos[0] === 0) {
			return Facing.Right;
		}

		if (pos[0] === size[0] - 1) {
			return Facing.Left;
		}
	}

	if (pos[1] === size[1] - 1) {
		if (facing === Facing.Down) {
			return (pos[0] < size[0] / 2) ? Facing.Right : Facing.Left;
		}

		return facing;
	}

	if ((pos[0] === 1 && facing === Facing.Left) || (pos[0] === size[0] - 2 && facing === Facing.Right)) {
		// Turn down.
		return Facing.Down;
	}

	if (pos[0] === 1 && facing !== Facing.Right) {
		return (facing === Facing.Down) ? Facing.Right : Facing.Down;
	}

	if (pos[0] === size[0] - 2 && facing !== Facing.Left) {
		return (facing === Facing.Down) ? Facing.Left : Facing.Down;
	}

	return facing;
}
