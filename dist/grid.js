export default function grid(ctx, gameState) {
  const widthCells = gameState.settings.gridWidth;
  const heightCells = gameState.settings.gridHeight;
  const cellSize = cellSizeHelper(ctx, gameState);
  const gridW = widthCells * cellSize;
  const gridH = heightCells * cellSize;
  const centerX = ctx.canvas.width / 2;
  const centerY = ctx.canvas.height / 2;
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(Math.round(centerX - gridW / 2), Math.round(centerY - gridH / 2));
  ctx.lineTo(Math.round(centerX + gridW / 2), Math.round(centerY - gridH / 2));
  ctx.lineTo(Math.round(centerX + gridW / 2), Math.round(centerY + gridH / 2));
  ctx.lineTo(Math.round(centerX - gridW / 2), Math.round(centerY + gridH / 2));
  ctx.lineTo(Math.round(centerX - gridW / 2), Math.round(centerY - gridH / 2));
  ctx.lineTo(Math.round(centerX + gridW / 2), Math.round(centerY - gridH / 2));
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeStyle = "rgba(1.0, 1.0, 1.0, 0.5)";
  ctx.lineWidth = 1;
  const left = centerX - gridW / 2;
  const top = centerY - gridH / 2;
  for (let i = 1; i < widthCells; i++) {
    ctx.moveTo(Math.round(left + cellSize * i) + 0.5, Math.round(top));
    ctx.lineTo(Math.round(left + cellSize * i) + 0.5, Math.round(top + cellSize * heightCells));
  }
  for (let i = 1; i < heightCells; i++) {
    ctx.moveTo(Math.round(left), Math.round(top + cellSize * i) + 0.5);
    ctx.lineTo(Math.round(left + cellSize * widthCells), Math.round(top + cellSize * i) + 0.5);
  }
  ctx.stroke();
}
export function cellSizeHelper(ctx, gameState) {
  const widthCells = gameState.settings.gridWidth;
  const heightCells = gameState.settings.gridHeight;
  const fieldW = ctx.canvas.width - 32;
  const fieldH = ctx.canvas.height - 96;
  const cellSize = Math.min(fieldW / widthCells, fieldH / heightCells);
  return cellSize;
}
export function cellPositionHelper(ctx, gameState, position, cellSizeInput) {
  const widthCells = gameState.settings.gridWidth;
  const heightCells = gameState.settings.gridHeight;
  const cellSize = cellSizeInput || cellSizeHelper(ctx, gameState);
  const gridW = widthCells * cellSize;
  const gridH = heightCells * cellSize;
  const centerX = ctx.canvas.width / 2;
  const centerY = ctx.canvas.height / 2;
  const left = centerX - gridW / 2;
  const top = centerY - gridH / 2;
  return [
    left + cellSize * (position[0] + 0.5),
    top + cellSize * (position[1] + 0.5)
  ];
}
export function posCompare(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}
export function addPos(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}
export function interPos(a, b, c) {
  const delta = [(b[0] - a[0]) * c, (b[1] - a[1]) * c];
  return addPos(a, delta);
}
export function distance(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}
