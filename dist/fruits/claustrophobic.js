import {cellPositionHelper, cellSizeHelper, distance} from "../grid.js";
import {Fruit} from "./base.js";
export class ClaustrophobicFruit extends Fruit {
  static roll(gameState) {
    if (gameState.fruits.some((fruit) => fruit instanceof ClaustrophobicFruit)) {
      return false;
    }
    const snakeLength = gameState.players.map((player) => player.snake).map((snake2) => snake2.len).reduce((previous, curr, _index) => previous + curr, 0);
    const size = gameState.settings.gridHeight * gameState.settings.gridWidth;
    const snakeBoardFrac = snakeLength / size;
    if (snakeBoardFrac > 0.4) {
      return false;
    }
    return true;
  }
  static spawn(gameState) {
    let x;
    let y;
    let attempts = 0;
    do {
      x = Math.floor(1 + Math.random() * (gameState.settings.gridWidth - 2));
      y = Math.floor(1 + Math.random() * (gameState.settings.gridHeight - 2));
      attempts += 1;
      if (attempts > 2) {
        return;
      }
    } while (gameState.players.some((player) => player.snake.intersects([x, y])) || gameState.players.some((player) => new ClaustrophobicFruit([x, y]).check(gameState, player.snake).disappear));
    gameState.fruits.push(new ClaustrophobicFruit([x, y]));
  }
  constructor(position) {
    super();
    this.position = position;
  }
  check(gameState, snake2) {
    const head = snake2.tail[0];
    if (head[0] === this.position[0] && head[1] === this.position[1]) {
      return {
        scoreDelta: 1,
        lenDelta: 1,
        disappear: true,
        snake: void 0
      };
    }
    const occupied = new Set();
    const visited = new Set();
    const queue = new Array();
    function pos2int(pos) {
      return pos[0] + gameState.settings.gridWidth * pos[1];
    }
    for (const snake3 of gameState.players.map((player) => player.snake)) {
      for (const pos of snake3.tail) {
        occupied.add(pos2int(pos));
      }
    }
    queue.push(this.position);
    while (queue.length > 0) {
      const p = queue.pop();
      if (p[0] === 0 || p[0] === gameState.settings.gridWidth - 1 || p[1] === 0 || p[1] === gameState.settings.gridHeight - 1) {
        console.log(`Found position ${p.toString()}`);
        return {
          scoreDelta: 0,
          lenDelta: 0,
          disappear: false,
          snake: void 0
        };
      }
      visited.add(pos2int(p));
      let toAdd = new Array();
      for (let x = -1; x < 2; x += 2) {
        toAdd.push([p[0] + x, p[1]]);
      }
      for (let y = -1; y < 2; y += 2) {
        toAdd.push([p[0], p[1] + y]);
      }
      toAdd = toAdd.filter((pos) => !(occupied.has(pos2int(pos)) || visited.has(pos2int(pos))));
      for (const cell of toAdd) {
        queue.push(cell);
      }
    }
    return {
      scoreDelta: 5,
      lenDelta: 0,
      disappear: true,
      snake: snake2
    };
  }
  draw(gameState, ctx) {
    const cellSize = cellSizeHelper(ctx, gameState);
    const scrPos = cellPositionHelper(ctx, gameState, this.position, cellSize);
    const playerHeads = gameState.players.map((player) => player.snake.tail[0]);
    let shortestDistance = 99999;
    let shortest;
    for (const head of playerHeads) {
      const dist = distance(head, this.position);
      if (dist < shortestDistance) {
        shortestDistance = dist;
        shortest = head;
      }
    }
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.ellipse(scrPos[0], scrPos[1], cellSize * 0.4, cellSize * 0.4, 0, 0, 360);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = "black";
    const angle = Math.atan2(this.position[1] - shortest[1], this.position[0] - shortest[0]) + Math.PI;
    const offset = cellSize * 0.3;
    const x = scrPos[0] + offset * Math.cos(angle);
    const y = scrPos[1] + offset * Math.sin(angle);
    ctx.ellipse(x, y, cellSize * 0.2, cellSize * 0.2, 0, 0, 360);
    ctx.fill();
  }
}
