import {cellSizeHelper, cellPositionHelper} from "./grid.js";
export default function snake(ctx, gameState, delta) {
  for (const player of gameState.players) {
    if (player === void 0) {
      continue;
    }
    player.snake.tick(gameState, ctx, delta);
  }
}
var Facing;
(function(Facing2) {
  Facing2[Facing2["Uninit"] = 0] = "Uninit";
  Facing2[Facing2["Up"] = 1] = "Up";
  Facing2[Facing2["Right"] = 2] = "Right";
  Facing2[Facing2["Down"] = 3] = "Down";
  Facing2[Facing2["Left"] = 4] = "Left";
})(Facing || (Facing = {}));
export class Snake {
  constructor(player) {
    this.tail = [];
    this.score = 0;
    this.facing = 0;
    this.dying = false;
    this.player = player;
    this.timer = 0;
  }
  speed() {
    return 1e3 / this.tail.length;
  }
  tick(gameState, ctx, delta) {
    if (!gameState.gameStarted) {
      return;
    }
    const player = gameState.players.find((v) => v.controllerId === this.player);
    const x = player.movement[0];
    const y = player.movement[1];
    let f = this.facing;
    if (x > 0) {
      f = 2;
    }
    if (x < 0) {
      f = 4;
    }
    if (y < 0) {
      f = 1;
    }
    if (y > 0) {
      f = 3;
    }
    let badDirection;
    switch (this.facing) {
      case 1: {
        badDirection = 3;
        break;
      }
      case 3: {
        badDirection = 1;
        break;
      }
      case 4: {
        badDirection = 2;
        break;
      }
      case 2: {
        badDirection = 4;
        break;
      }
      default: {
        badDirection = 0;
      }
    }
    if (f !== badDirection) {
      this.facing = f;
    }
    if (this.facing === 0) {
      let x2 = Math.floor(Math.random() * gameState.settings.gridWidth);
      let y2 = Math.floor(Math.random() * gameState.settings.gridHeight);
      let cx = gameState.settings.gridWidth / 2;
      let cy = gameState.settings.gridHeight / 2;
      if (Math.abs(cx - x2) > Math.abs(cy - y2)) {
        if (x2 > cx) {
          this.facing = 4;
        } else {
          this.facing = 2;
        }
      } else {
        if (y2 > cy) {
          this.facing = 1;
        } else {
          this.facing = 3;
        }
      }
      this.tail.push([x2, y2]);
    }
    this.timer += delta;
    if (this.timer > this.speed()) {
      this.move(gameState);
      this.timer = 0;
    }
    ctx.strokeStyle = "white";
    ctx.lineWidth = cellSizeHelper(ctx, gameState) * 0.8;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    let headPos = cellPositionHelper(ctx, gameState, this.tail[0], ctx.lineWidth);
    ctx.moveTo(headPos[0], headPos[1]);
    ctx.lineTo(headPos[0], headPos[1]);
    for (const position of this.tail) {
      let pos = cellPositionHelper(ctx, gameState, position, ctx.lineWidth);
      ctx.lineTo(pos[0], pos[1]);
    }
    ctx.stroke();
  }
  move(gameState) {
    let head = this.tail[0];
    switch (this.facing) {
      case 1: {
        head = addPos(head, [0, -1]);
        break;
      }
      case 3: {
        head = addPos(head, [0, 1]);
        break;
      }
      case 2: {
        head = addPos(head, [1, 0]);
        break;
      }
      case 4: {
        head = addPos(head, [-1, 0]);
        break;
      }
      default: {
        break;
      }
    }
    this.tail.unshift(head);
    this.tail.pop();
  }
}
function addPos(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}
