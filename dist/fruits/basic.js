import {cellPositionHelper, cellSizeHelper} from "../grid.js";
import {Fruit} from "./base.js";
export class BasicFruit extends Fruit {
  static roll(gameState) {
    const counter = gameState.fruits.filter((v) => v instanceof BasicFruit).length;
    return counter < 2;
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
      return {
        scoreDelta: 1,
        lenDelta: 1,
        disappear: true,
        snake: void 0
      };
    }
    return {
      scoreDelta: 0,
      lenDelta: 0,
      disappear: false,
      snake: void 0
    };
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
