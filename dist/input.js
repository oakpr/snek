export const maxPlayers = 2;
export const players = [];
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
      this.associatedEntity = 0;
      this.disconnected = false;
    } else {
      this.controllerId = -1;
      this.movement = [0, 0];
      this.buttons = [keysPressedMap.z, keysPressedMap.x];
      this.associatedEntity = 0;
      this.disconnected = false;
    }
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
  }
}
export function tickPlayerInput() {
  const existingPlayers = players.filter(Boolean).map((v) => v.controllerId);
  const newControllers = navigator.getGamepads().filter((v) => !existingPlayers.includes(v.index)).filter((v) => v.buttons.some(Boolean)).map((v) => new Player(v));
  if (!existingPlayers.includes(-1)) {
    let keyboardActive;
    for (const key of ["z", "x", "arrowup", "arrowdown", "arrowleft", "arrowright"]) {
      keyboardActive = keyboardActive || keysPressedMap[key];
    }
    if (keyboardActive) {
      newControllers.push(new Player(null));
    }
  }
  for (const player of newControllers) {
    const emptySlot = players.indexOf(null);
    if (emptySlot !== -1) {
      players[emptySlot] = player;
    } else if (players.length < maxPlayers) {
      players.push(player);
    } else {
      console.log("can't add new player");
      continue;
    }
    console.log(players);
  }
  for (const player of players) {
    if (!player) {
      continue;
    }
    player.tick();
    if (player.disconnected) {
      console.log(`dropped player ${player.controllerId}`);
      players[players.indexOf(player)] = null;
      continue;
    }
  }
}