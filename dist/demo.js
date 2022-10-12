import {Facing} from "./snake.js";
export default function demo(size, pos, facing) {
  if (size[1] % 2 === 0) {
    return auto1s(size, pos);
  }
  return auto2s(size, pos, facing);
}
function auto1s(size, pos) {
  if (pos[0] === 0) {
    return pos[1] === 0 ? Facing.Right : Facing.Up;
  }
  if (pos[0] === size[0] - 1) {
    return pos[1] % 2 === 1 ? Facing.Left : Facing.Down;
  }
  if (pos[0] === 1 && pos[1] !== size[1] - 1) {
    return pos[1] % 2 === 0 ? Facing.Right : Facing.Down;
  }
  return pos[1] % 2 === 0 ? Facing.Right : Facing.Left;
}
function auto2s(size, pos, facing) {
  if (pos[1] === 0 && facing === Facing.Up) {
    return pos[0] === size[0] - 1 ? Facing.Left : Facing.Right;
  }
  if (pos[0] === 0 || pos[0] === size[0] - 1) {
    return Facing.Up;
  }
  if (pos[1] === 0) {
    if (pos[0] === 0) {
      return Facing.Right;
    }
    if (pos[0] === size[0] - 1) {
      return Facing.Left;
    }
  }
  if (pos[1] === size[1] - 1) {
    if (facing === Facing.Down) {
      return pos[0] < size[0] / 2 ? Facing.Right : Facing.Left;
    }
    return facing;
  }
  if (pos[0] === 1 && facing === Facing.Left || pos[0] === size[0] - 2 && facing === Facing.Right) {
    return Facing.Down;
  }
  if (pos[0] === 1 && facing !== Facing.Right) {
    return facing === Facing.Down ? Facing.Right : Facing.Down;
  }
  if (pos[0] === size[0] - 2 && facing !== Facing.Left) {
    return facing === Facing.Down ? Facing.Left : Facing.Down;
  }
  return facing;
}
