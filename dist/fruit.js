import {cellPositionHelper, cellSizeHelper} from "./grid.js";
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
        snake.score += result[0];
        snake.len += result[1];
        return result[2];
      }
    }
    return false;
  }
  draw(gameState, ctx) {
  }
  check(gameState, snake) {
    return [0, 0, false];
  }
}
export class BasicFruit extends Fruit {
  static roll(gameState) {
    return gameState.fruits.findIndex((v) => v instanceof BasicFruit) === -1;
  }
  static spawn(gameState) {
    const x = Math.floor(Math.random() * gameState.settings.gridWidth);
    const y = Math.floor(Math.random() * gameState.settings.gridHeight);
    gameState.fruits.push(new BasicFruit([x, y]));
  }
  constructor(position) {
    super();
    this.position = position;
  }
  check(gameState, snake) {
    const head = snake.tail[0];
    if (head[0] === this.position[0] && head[1] === this.position[1]) {
      return [1, 1, true];
    }
    return [0, 0, false];
  }
  draw(gameState, ctx) {
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
}
export const fruitKinds = [BasicFruit];
export default function fruit(gameState, ctx) {
  for (let i = gameState.fruits.length - 1; i >= 0; i--) {
    if (gameState.fruits[i].tick(gameState)) {
      gameState.fruits.splice(i, 1);
    }
  }
  for (const fruitKind of fruitKinds) {
    if (fruitKind.roll(gameState)) {
      fruitKind.spawn(gameState);
    }
  }
  for (const fruit2 of gameState.fruits) {
    fruit2.draw(gameState, ctx);
  }
}
