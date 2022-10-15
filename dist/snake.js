import {cellSizeHelper, cellPositionHelper, interPos, distance, addPos, posCompare} from "./grid.js";
import auto from "./demo.js";
export default function snake(ctx, gameState, delta) {
  for (const player of gameState.players) {
    if (player === void 0) {
      continue;
    }
    player.snake.tick(gameState, ctx, delta);
  }
}
export var Facing;
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
    this.len = 4;
    this.score = 0;
    this.facing = 0;
    this.dying = false;
    this.player = player;
    this.timer = 0;
    this.combo = 0;
    this.colorTimer = 0;
    this.thickness = 0.8;
  }
  speed() {
    return 1e3 / (Math.sqrt(2 * (this.combo + 0.5)) + Math.sqrt(this.len / 2));
  }
  tick(gameState, ctx, delta) {
    if (this.facing === 0) {
      const x2 = Math.floor(Math.random() * gameState.settings.gridWidth);
      const y2 = Math.floor(Math.random() * gameState.settings.gridHeight);
      const cx = gameState.settings.gridWidth / 2;
      const cy = gameState.settings.gridHeight / 2;
      if (Math.abs(cx - x2) > Math.abs(cy - y2)) {
        this.facing = x2 > cx ? 4 : 2;
      } else if (y2 > cy) {
        this.facing = 1;
      } else {
        this.facing = 3;
      }
      this.lastFacing = this.facing;
      this.tail.push([x2, y2]);
    }
    this.combo -= delta / 3e3;
    this.combo = Math.max(this.combo, 0);
    this.thickness = (this.thickness * 2 + 0.8) / 3;
    const player = gameState.players.find((v) => v.controllerId === this.player);
    const x = player.movement[0];
    const y = player.movement[1];
    let f = this.facing;
    const oldF = this.facing;
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
    switch (this.lastFacing) {
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
    if (player.buttonsDirty[0] || gameState.settings.fast) {
      this.timer = this.speed();
    }
    this.timer += delta;
    if (this.timer > this.speed()) {
      if (gameState.settings.autoMode) {
        this.facing = auto([gameState.settings.gridWidth, gameState.settings.gridHeight], this.tail[0], oldF);
      }
      this.timer = 0;
      this.move(gameState);
    }
    const color = this.color(delta / 1e3);
    ctx.strokeStyle = `hsl(${color.join(",")})`;
    const w = cellSizeHelper(ctx, gameState);
    ctx.lineWidth = w * 0.8 * this.thickness;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    if (this.tail.length > 1) {
      const headPos = cellPositionHelper(ctx, gameState, this.tail[0], w);
      let nextPos = cellPositionHelper(ctx, gameState, this.tail[1], w);
      const interp = (this.timer / this.speed()) ** (1 / 4);
      const animHeadPos = interPos(nextPos, headPos, interp);
      ctx.moveTo(animHeadPos[0], animHeadPos[1]);
      if (distance(this.tail[1], this.tail[0]) === 1) {
        ctx.lineTo(animHeadPos[0], animHeadPos[1]);
        ctx.lineTo(nextPos[0], nextPos[1]);
      } else {
        ctx.moveTo(headPos[0], headPos[1]);
        ctx.lineTo(headPos[0], headPos[1]);
      }
      let lastPos = nextPos;
      for (const position of this.tail.slice(1, -1)) {
        const pos = cellPositionHelper(ctx, gameState, position, w);
        if (distance(lastPos, position) === 1) {
          ctx.lineTo(pos[0], pos[1]);
        } else {
          ctx.moveTo(pos[0], pos[1]);
          ctx.lineTo(pos[0], pos[1]);
        }
        lastPos = position;
      }
      const tailPos = cellPositionHelper(ctx, gameState, this.tail[this.tail.length - 1], w);
      nextPos = cellPositionHelper(ctx, gameState, this.tail[this.tail.length - 2], w);
      if (distance(this.tail[this.tail.length - 1], this.tail[this.tail.length - 2]) === 1) {
        if (this.tail.length < this.len) {
          ctx.lineTo(nextPos[0], nextPos[1]);
          ctx.lineTo(tailPos[0], tailPos[1]);
        } else {
          const animTailPos = interPos(tailPos, nextPos, interp);
          ctx.lineTo(nextPos[0], nextPos[1]);
          ctx.lineTo(animTailPos[0], animTailPos[1]);
        }
      } else {
        ctx.moveTo(tailPos[0], tailPos[1]);
        ctx.lineTo(tailPos[0], tailPos[1]);
      }
    } else {
      const headPos = cellPositionHelper(ctx, gameState, this.tail[0], w);
      ctx.moveTo(headPos[0], headPos[1]);
      ctx.lineTo(headPos[0], headPos[1]);
    }
    ctx.stroke();
  }
  move(gameState) {
    this.lastFacing = this.facing;
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
    if (gameState.settings.wrap) {
      const w = gameState.settings.gridWidth;
      const h = gameState.settings.gridHeight;
      if (head[0] < 0) {
        head[0] = w - 1;
      } else if (head[0] >= w) {
        head[0] = 0;
      }
      if (head[1] < 0) {
        head[1] = h - 1;
      } else if (head[1] >= h) {
        head[1] = 0;
      }
    } else {
    }
    this.tail.unshift(head);
    while (this.tail.length > this.len) {
      this.tail.pop();
    }
  }
  intersects(p) {
    if (this.tail.some((segment) => posCompare(segment, p))) {
      return true;
    }
    return false;
  }
  color(delta) {
    const fac = Math.sqrt(this.combo);
    this.colorTimer += delta * fac;
    const hue = this.colorTimer * 30 % 360;
    const colorness = Math.min(fac, 1);
    const sat = colorness * 100;
    const value = (1 - (colorness / 2) ** 2) * 100;
    return [hue, `${sat}%`, `${value}%`];
  }
}
