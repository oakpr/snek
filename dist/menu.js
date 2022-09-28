const options = [
  ["snek menu"],
  ["enable bg?", "enable_bg", [true, false]],
  ["wrap?", "wrap", [true, false]],
  ["press a to start"]
];
let cursorPos = 1;
export default function menu(ctx, gameState) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(32, 64, ctx.canvas.width - 64, ctx.canvas.height - 128);
  for (let i = -2; i < 3; i++) {
    const index = cursorPos + i;
    if (index < 0 || index >= options.length) {
      continue;
    }
    const x = ctx.canvas.width / 2;
    const y = ctx.canvas.height / 2 + 64 * i;
    const width = ctx.canvas.width - 128;
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.font = i === 0 ? "32px Major Mono Display" : "24px Major Mono Display";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (options[index][2]?.length > 0) {
      ctx.fillText(`${i === 0 ? "< " : ""}${options[index][0]}: ${gameState.settings.has(options[index][1]) ? gameState.settings.get(options[index][1]) : options[index][2][0]}${i === 0 ? " >" : ""}`, x, y, width);
    } else {
      ctx.fillText(options[index][0], x, y, width);
    }
  }
  const key = options[cursorPos][1];
  const values = options[cursorPos][2] || false;
  if (gameState.players[0]?.movementDirty) {
    if (Math.abs(gameState.players[0].movement[1]) > 0.7) {
      const delta = Math.round(gameState.players[0].movement[1]);
      cursorPos += delta;
      cursorPos %= options.length;
      if (cursorPos < 0) {
        cursorPos += options.length;
      }
      return;
    }
    if (values && values.length > 0 && Math.abs(gameState.players[0].movement[0]) > 0.7) {
      let currentSetting = values.includes(gameState.settings.get(key)) ? values.indexOf(gameState.settings.get(key)) : 0;
      const delta = Math.round(gameState.players[0].movement[0]);
      currentSetting += delta;
      currentSetting %= values.length;
      if (currentSetting < 0) {
        currentSetting += values.length;
      }
      gameState.settings.set(key, values[currentSetting]);
    }
  }
  if (gameState.players[0]?.buttons[0]) {
    gameState.gameStarted = true;
  }
}
