import {cellPositionHelper, cellSizeHelper} from "./grid.js";
let food;
const expansionRate = 1;
export function update(gameState) {
  if (!food) {
    food = getRandomFoodPosition(gameState);
  }
  for (const snake of gameState.players.map((p) => p.snake)) {
    if (snake.intersects(food)) {
      snake.len += expansionRate;
      food = getRandomFoodPosition(gameState);
    }
  }
}
export function draw(gameState, ctx) {
  const scrPos = cellPositionHelper(ctx, gameState, this.position, cellSizeHelper(ctx, gameState));
  ctx.beginPath();
  ctx.moveTo(scrPos[0] - 10, scrPos[1]);
  ctx.lineTo(scrPos[0], scrPos[1] - 10);
  ctx.lineTo(scrPos[0] + 10, scrPos[1]);
  ctx.lineTo(scrPos[0], scrPos[1] + 10);
  ctx.lineTo(scrPos[0] - 10, scrPos[1]);
  ctx.fillStyle = "white";
  ctx.fill();
}
function getRandomFoodPosition(gameState) {
  return [0, 0];
}
