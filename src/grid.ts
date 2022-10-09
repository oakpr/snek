import type {GameState} from 'src';

// Draw the grid for this frame.
// Takes the context for drawing and reading the canvas dimensions.
// Takes the GameState to read the grid dimensions.
export default function grid(ctx: CanvasRenderingContext2D, gameState: GameState) {
	// Copy the grid dimensions into scope.
	const widthCells = gameState.settings.gridWidth;
	const heightCells = gameState.settings.gridHeight;

	// Call the cellSizeHelper to get the correct cell size.
	const cellSize = cellSizeHelper(ctx, gameState);

	// Find some important vectors in screen space.
	// Find the width and height of the grid in screen space.
	const gridW = widthCells * cellSize;
	const gridH = heightCells * cellSize;
	// Find the X and Y coordinate of the center of the screen.
	const centerX = ctx.canvas.width / 2;
	const centerY = ctx.canvas.height / 2;

	// Draw borders
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 2;
	ctx.beginPath();
	// Draw the top-left corner.
	ctx.moveTo(centerX - (gridW / 2), centerY - (gridH / 2));
	// Top-right.
	ctx.lineTo(centerX + (gridW / 2), centerY - (gridH / 2));
	// Bottom-right.
	ctx.lineTo(centerX + (gridW / 2), centerY + (gridH / 2));
	// Bottom-left.
	ctx.lineTo(centerX - (gridW / 2), centerY + (gridH / 2));
	// Top-left again, to close the shape.
	ctx.lineTo(centerX - (gridW / 2), centerY - (gridH / 2));
	// Top-right again, to ensure consistent corners.
	ctx.lineTo(centerX + (gridW / 2), centerY - (gridH / 2));
	ctx.stroke();
	ctx.beginPath();
	// Set the stroke style again, this time to a slightly transparent black.
	ctx.strokeStyle = 'rgba(1.0, 1.0, 1.0, 0.5)';
	// Reset line width.
	ctx.lineWidth = 1;

	// Store the top-left corner's coordinates.
	const left = centerX - (gridW / 2);
	const top = centerY - (gridH / 2);
	// Draw vertical lines
	for (let i = 1; i < widthCells; i++) {
		ctx.moveTo(left + (cellSize * i), top);
		ctx.lineTo(left + (cellSize * i), top + (cellSize * heightCells));
	}

	// Draw horizontal lines
	for (let i = 1; i < heightCells; i++) {
		ctx.moveTo(left, top + (cellSize * i));
		ctx.lineTo(left + (cellSize * widthCells), top + (cellSize * i));
	}

	ctx.stroke();
}

// Calculates the size of the grid cells.
// Takes the context to get the canvas dimensions.
// Takes the GameState to get the grid dimensions.
export function cellSizeHelper(ctx: CanvasRenderingContext2D, gameState: GameState): number {
	// Copy the grid dimensions into scope.
	const widthCells = gameState.settings.gridWidth;
	const heightCells = gameState.settings.gridHeight;

	// Cut off the parts of the screen that aren't allowed to hold the grid.
	const fieldW = ctx.canvas.width - 32;
	const fieldH = ctx.canvas.height - 96;

	// Calculate the cell size in pixels for both axes, and take the smaller of the two.
	const cellSize = Math.min(
		fieldW / widthCells,
		fieldH / heightCells,
	);
	return cellSize;
}

// Convert a position from grid-space to screen-space.
// Takes the context to measure the canvas dimensions.
// Takes the GameState to measure the grid dimensions.
// Takes a pair of numbers as a position in grid-space.
// Optionally, takes an already-calculated cell size.
export function cellPositionHelper(ctx: CanvasRenderingContext2D, gameState: GameState, position: [number, number], cellSizeInput: number | undefined): [number, number] {
	// Copy the grid dimensions into scope.
	const widthCells = gameState.settings.gridWidth;
	const heightCells = gameState.settings.gridHeight;

	// Calculate the cell size, but only if it hasn't been passed already.
	const cellSize = cellSizeInput || cellSizeHelper(ctx, gameState);
	// Get the grid's dimensions in screen space.
	const gridW = widthCells * cellSize;
	const gridH = heightCells * cellSize;
	// Get the screen coordinates of the center.
	const centerX = ctx.canvas.width / 2;
	const centerY = ctx.canvas.height / 2;
	// Get the screen coordinates of the top-left corner.
	const left = centerX - (gridW / 2);
	const top = centerY - (gridH / 2);

	// Return the converted coordinates, adding 0.5 to each axis to end up in the center of the cell.
	return [
		left + (cellSize * (position[0] + 0.5)),
		top + (cellSize * (position[1] + 0.5)),
	];
}
