export default function snake(ctx, gameState, delta) {
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
  constructor() {
    this.tail = [];
    this.score = 0;
    this.facing = 0;
    this.dying = false;
  }
  speed() {
    return 1 / this.tail.length;
  }
  tick(gameState, ctx, delta) {
  }
  move(gameState) {
  }
}
