export default function hud(game_state, _delta, ctx) {
  ctx.fillStyle = "rgba(0,0,0,128)";
  ctx.fillRect(0, 0, ctx.canvas.width, 36);
  ctx.fillRect(0, ctx.canvas.height - 34, ctx.canvas.width, 64);
  ctx.strokeStyle = "white";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "32px Major Mono Display";
  ctx.fillText("snek", ctx.canvas.width / 2, 15);
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.font = "16px Major Mono Display";
  ctx.fillText(`score ${game_state.score}`, 10, ctx.canvas.height - 10);
}
