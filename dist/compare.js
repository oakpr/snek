import {chooseCategory} from "./category.js";
import {GameMode} from "./game-mode.js";
import {hscoreCache} from "./hiscore.js";
import {defaultGameState} from "./index.js";
let scores;
const sortedScores = [];
let nowIndex = -1;
let cursor = 0;
export default function compareScores(gameState, ctx) {
  const scoresCache = hscoreCache();
  if (!scoresCache || scores === true) {
    return;
  }
  if (scores === void 0) {
    scores = true;
    void refreshScores(scoresCache, chooseCategory(gameState.settings), gameState);
    return;
  }
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const left = 64;
  const width = ctx.canvas.width - 128;
  const middle = ctx.canvas.height / 2;
  const size = 32;
  const range = ctx.canvas.height / (size * 3);
  ctx.strokeStyle = "white";
  ctx.font = `${size}px Major Mono Display`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  for (let i = -range; i <= range; i++) {
    const index = cursor + i;
    if (index < 0 || index >= sortedScores.length) {
      continue;
    }
    const yp = middle + size * i;
    const [name, score, now] = sortedScores[index];
    const text = `${now ? ">" : i === 0 ? "%" : " "}${name.toLowerCase()}: ${score} (#${index + 1})`;
    ctx.strokeText(text, left, yp, width);
  }
  const controls = gameState.players.find(Boolean);
  if (!controls) {
    return;
  }
  if (Math.abs(controls.movement[1]) < 0.7) {
    suppressY = false;
  }
  vscroll(gameState, controls);
  if (Math.abs(controls.movement[1]) > 0.7) {
    suppressY = true;
  }
  if (controls.buttons[0] && controls.buttonsDirty[0]) {
    Object.assign(gameState, JSON.parse(JSON.stringify(defaultGameState)));
    gameState.gameMode = GameMode.Menu;
  }
}
let suppressY = false;
async function refreshScores(data, category, gameState) {
  scores = {};
  Object.assign(scores, JSON.parse(localStorage.getItem("scores") || "{}"));
  if (data) {
    const response = await fetch(data.server + "/snek%20" + encodeURIComponent(category) + "/board.json");
    const text = await response.text();
    const remote = JSON.parse(text);
    for (const [name, score] of Object.entries(remote)) {
      if (!Object.hasOwn(scores, name) || scores[name] < score) {
        scores[name] = score;
      }
    }
  }
  let currentHi = false;
  for (const [name, score] of Object.entries(scores)) {
    const current = name === gameState.name && score === gameState.highScore;
    sortedScores.push([name, score, current]);
    currentHi = current || currentHi;
  }
  if (!currentHi) {
    sortedScores.push([gameState.name, gameState.score, true]);
  }
  sortedScores.sort((a, b) => b[1] - a[1]);
  nowIndex = sortedScores.findIndex(([_, __, b]) => b);
  cursor = nowIndex;
}
function vscroll(gameState, controls) {
  if (Math.abs(controls.movement[1]) > 0.7 && !suppressY) {
    cursor += Math.sign(controls.movement[1]);
    if (cursor < 0) {
      cursor = sortedScores.length - 1;
    } else if (cursor >= sortedScores.length) {
      cursor = 0;
    }
  }
}
