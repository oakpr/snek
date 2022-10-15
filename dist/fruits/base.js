export class Fruit {
  static roll(gameState) {
    return false;
  }
  static spawn(gameState) {
  }
  tick(gameState) {
    for (const snake of gameState.players.map((p) => p.snake)) {
      if (snake.timer === 0) {
        const result = this.check(gameState, snake);
        result.snake = snake;
        return result;
      }
    }
    return false;
  }
  draw(gameState, ctx) {
  }
  check(gameState, snake) {
    return {
      scoreDelta: 0,
      lenDelta: 0,
      disappear: false,
      snake: void 0
    };
  }
}
