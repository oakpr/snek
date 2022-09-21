const bgTileSize = 12;
export function background(game_state, ctx) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return;
  }
  for (let x = 0; x < ctx.canvas.width; x += 4) {
    for (let y = 0; y < ctx.canvas.height + 20; y += bgTileSize) {
      const timer = game_state.clock / 5e3 + Math.sin(y / 5 + game_state.clock / -500) / 5 + Math.cos(x / 5 + game_state.clock / 100) / 15;
      const r = 128 + 127 * Math.sin(timer);
      const g = 128 + 127 * Math.sin(timer + 2 * Math.PI / 3);
      const b = 128 + 127 * Math.sin(timer + 4 * Math.PI / 3);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      if (x === 0 && y === 0) {
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
      const offset = Math.sin(y / 20 + (game_state.clock / 5e3 + Math.sin(y / 5))) * 500;
      ctx.fillRect(nicerModulo(x + offset, ctx.canvas.width + 20) - 10, nicerModulo(y + game_state.clock / 50, ctx.canvas.height + 20) - 10, 5, bgTileSize);
    }
  }
}
function nicerModulo(n, quot) {
  while (n > quot) {
    n -= quot;
  }
  while (n < 0) {
    n += quot;
  }
  return n;
}
