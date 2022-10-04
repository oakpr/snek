import type {GameState} from 'src';

export default function grid(ctx: CanvasRenderingContext2D, gameState: GameState) {
	const widthCells = gameState.settings.gridWidth as number;
	const heightCells = gameState.settings.gridHeight as number;
	const cellSize = cellSizeHelper(ctx, gameState);

	const gridW = widthCells * cellSize;
	const gridH = heightCells * cellSize;
	const centerX = ctx.canvas.width / 2;
	const centerY = ctx.canvas.height / 2;

	// Draw borders
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(centerX - (gridW / 2), centerY - (gridH / 2));
	ctx.lineTo(centerX + (gridW / 2), centerY - (gridH / 2));
	ctx.lineTo(centerX + (gridW / 2), centerY + (gridH / 2));
	ctx.lineTo(centerX - (gridW / 2), centerY + (gridH / 2));
	ctx.lineTo(centerX - (gridW / 2), centerY - (gridH / 2));
	ctx.lineTo(centerX + (gridW / 2), centerY - (gridH / 2));
	ctx.stroke();
	ctx.beginPath();
	ctx.strokeStyle = 'rgba(1.0, 1.0, 1.0, 0.5)';
	ctx.lineWidth = 1;

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

export function cellSizeHelper(ctx: CanvasRenderingContext2D, gameState: GameState): number {
	const widthCells = gameState.settings.gridWidth as number;
	const heightCells = gameState.settings.gridHeight as number;
	const fieldW = ctx.canvas.width - 32;
	const fieldH = ctx.canvas.height - 96;
	const cellSize = Math.min(
		fieldW / widthCells,
		fieldH / heightCells,
	);
	return cellSize;
}

export function cellPositionHelper(ctx: CanvasRenderingContext2D, gameState: GameState, position: [number, number], cellSizeInput: number | undefined): [number, number] {
	const widthCells = gameState.settings.gridWidth as number;
	const heightCells = gameState.settings.gridHeight as number;
	const cellSize = cellSizeInput || cellSizeHelper(ctx, gameState);
	const gridW = widthCells * cellSize;
	const gridH = heightCells * cellSize;
	const centerX = ctx.canvas.width / 2;
	const centerY = ctx.canvas.height / 2;
	const left = centerX - (gridW / 2);
	const top = centerY - (gridH / 2);

	return [
		left + (cellSize * (position[0] + 0.5)),
		top + (cellSize * (position[1] + 0.5)),
	];
}
