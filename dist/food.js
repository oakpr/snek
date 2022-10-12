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
}
function getRandomFoodPosition(gameState) {
  return [0, 0];
}
