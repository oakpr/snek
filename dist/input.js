import {Snake} from "./snake.js";
export const maxPlayers = 2;
const keysPressedMap = {};
document.addEventListener("keydown", (event) => {
  keysPressedMap[event.key.toLocaleLowerCase()] = true;
});
document.addEventListener("keyup", (event) => {
  keysPressedMap[event.key.toLocaleLowerCase()] = false;
});
export class Player {
  constructor(controller) {
    if (controller) {
      this.controllerId = controller.index;
      this.movement = [controller.axes[0], controller.axes[1]];
      this.buttons = [controller.buttons[1].pressed, controller.buttons[0].pressed];
      this.snake = new Snake(controller.index);
      this.disconnected = false;
    } else {
      this.controllerId = -1;
      this.movement = [0, 0];
      this.buttons = [keysPressedMap.z, keysPressedMap.x];
      this.snake = new Snake(-1);
      this.disconnected = false;
    }
    this.buttonsDirty = [false, false];
    this.movementDirty = [false, false];
    this.oldButtons = this.buttons;
    this.oldMovement = this.movement;
  }
  tick() {
    if (this.controllerId >= 0) {
      let controller;
      for (const c of navigator.getGamepads()) {
        if (c === null) {
          continue;
        }
        if (c.index === this.controllerId) {
          controller = c;
          break;
        }
      }
      if (!controller) {
        this.disconnected = true;
        return;
      }
      this.movement = [controller.axes[0], controller.axes[1]];
      this.buttons = [controller.buttons[1].pressed, controller.buttons[0].pressed];
      this.movement[0] -= controller.buttons[14] ? 1 : 0;
      this.movement[0] += controller.buttons[15] ? 1 : 0;
      this.movement[1] -= controller.buttons[12] ? 1 : 0;
      this.movement[1] += controller.buttons[13] ? 1 : 0;
      if (this.buttons[8]) {
        this.disconnected = true;
      }
    } else {
      this.movement = [0, 0];
      this.movement[0] -= Number(keysPressedMap.arrowleft ? 1 : 0);
      this.movement[0] += Number(keysPressedMap.arrowright ? 1 : 0);
      this.movement[1] -= Number(keysPressedMap.arrowup ? 1 : 0);
      this.movement[1] += Number(keysPressedMap.arrowdown ? 1 : 0);
      this.buttons = [keysPressedMap.z || false, keysPressedMap.x || false];
      if (keysPressedMap.escape) {
        this.disconnected = true;
      }
    }
    const length = Math.sqrt(this.movement[0] ** 2 + this.movement[1] ** 2);
    if (length > 0) {
      this.movement[0] /= length;
      this.movement[1] /= length;
    }
    this.movementDirty = [false, false];
    for (let i = 0; i < this.oldMovement.length; i++) {
      this.movementDirty[i] = sign(Math.round(this.oldMovement[i] * 0.6)) !== sign(Math.round(this.movement[i] * 0.6));
    }
    this.oldMovement = this.movement;
    for (let i = 0; i < this.oldButtons.length; i++) {
      this.buttonsDirty[i] = this.oldButtons[i] !== this.buttons[i];
    }
    this.oldButtons = this.buttons;
  }
}
export function tickPlayerInput(gameState) {
  const existingPlayers = gameState.players.filter(Boolean).map((v) => v.controllerId);
  const newControllers = navigator.getGamepads().filter(Boolean).filter((v) => !existingPlayers.includes(v.index)).filter((v) => v.buttons.some(Boolean)).map((v) => new Player(v));
  if (!existingPlayers.includes(-1)) {
    let keyboardActive;
    for (const key of ["z", "x", "arrowup", "arrowdown", "arrowleft", "arrowright"]) {
      keyboardActive = keyboardActive || keysPressedMap[key];
    }
    if (keyboardActive) {
      const player = new Player(null);
      newControllers.push(player);
    }
  }
  for (const player of newControllers) {
    const emptySlot = gameState.players.indexOf(null);
    if (emptySlot !== -1) {
      gameState.players[emptySlot] = player;
    } else if (gameState.players.length < maxPlayers) {
      gameState.players.push(player);
    } else {
      console.log("can't add new player");
      continue;
    }
    console.log(gameState.players);
  }
  for (const player of gameState.players) {
    if (!player) {
      continue;
    }
    player.tick();
    if (player.disconnected) {
      console.log(`dropped player ${player.controllerId}`);
      gameState.players[gameState.players.indexOf(player)] = null;
      continue;
    }
  }
}
function sign(n) {
  return n ? n < 0 ? -1 : 1 : 0;
}
