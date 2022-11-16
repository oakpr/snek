import badWordsArray from "../_snowpack/pkg/naughty-words/en.json.proxy.js";
import {GameMode} from "./game-mode.js";
import {chooseCategory} from "./category.js";
import {defaultGameState} from "./index.js";
const letters = Array.from(Array.from({length: 26})).map((_, i) => i + 65).map((i) => String.fromCodePoint(i));
let hiscore;
const charLimit = 3;
let hcursor = 0;
const vcursors = Array.from({length: charLimit}).map((_) => 0);
const badNames = new Set(badWordsArray.filter((word) => word.length === charLimit));
void fetch("./hiscore.json").then((response) => {
  console.log("Finished requesting high score server data");
  console.log(response);
  void response.text().then((string_) => {
    console.log("Finished decoding high score server data");
    console.log(hiscore);
    hiscore = JSON.parse(string_);
  });
});
export default function hiScore(gameState, ctx) {
  if (!hiscore) {
    gameState.gameMode = GameMode.Menu;
  }
  const controls = gameState.players.find(Boolean);
  gameState.name = vcursors.map((v) => letters[v]).join("");
  draw(ctx, gameState);
  if (!controls) {
    return;
  }
  if (Math.abs(controls.movement[0]) < 0.7) {
    suppressX = false;
  }
  if (Math.abs(controls.movement[1]) < 0.7) {
    suppressY = false;
  }
  hscroll(gameState, controls);
  vscroll(gameState, controls);
  if (controls.buttons[0] && controls.buttonsDirty[0] && !badNames.has(gameState.name.toLowerCase())) {
    gameState.gameMode = GameMode.CompareScore;
    upload(gameState);
  }
  if (controls.buttons[1] && controls.buttonsDirty[1]) {
    Object.assign(gameState, JSON.parse(JSON.stringify(defaultGameState)));
    gameState.gameMode = GameMode.Menu;
  }
  if (Math.abs(controls.movement[0]) > 0.7) {
    suppressX = true;
  }
  if (Math.abs(controls.movement[1]) > 0.7) {
    suppressY = true;
  }
}
let suppressY = false;
let suppressX = false;
function draw(ctx, gameState) {
  const header = "input name";
  const topLine = Array.from({length: charLimit}).map((_, i) => i === hcursor ? "⇧" : " ").join(" ");
  const midLine = "⇦ " + Array.from({length: charLimit}).map((_, i) => letters[vcursors[i]]).join(" ") + " ⇨";
  const bottomLine = Array.from({length: charLimit}).map((_, i) => i === hcursor ? "⇩" : " ").join(" ");
  const footer = badNames.has(gameState.name.toLowerCase()) ? "no" : hiscore?.secret ? "a upload, b skip" : "a compare, b skip";
  ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
  ctx.fillRect(96, ctx.canvas.width / 2 - 128, ctx.canvas.width - 96 * 2, 256);
  ctx.font = "32px Major Mono Display";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const [i, t] of [header, topLine, midLine, bottomLine, footer].entries()) {
    const line = i - 2;
    const y = ctx.canvas.height / 2 + 48 * line;
    const x = ctx.canvas.width / 2;
    ctx.fillText(t.toLowerCase(), x, y, ctx.canvas.width - 128 * 2);
  }
}
function hscroll(gameState, controls) {
  if (Math.abs(controls.movement[0]) > 0.7 && !suppressX) {
    hcursor += Math.sign(controls.movement[0]);
    if (hcursor < 0) {
      hcursor = charLimit - 1;
    } else if (hcursor >= charLimit) {
      hcursor = 0;
    }
  }
}
function vscroll(gameState, controls) {
  if (Math.abs(controls.movement[1]) > 0.7 && !suppressY) {
    vcursors[hcursor] += Math.sign(controls.movement[1]);
    if (vcursors[hcursor] < 0) {
      vcursors[hcursor] = letters.length - 1;
    } else if (vcursors[hcursor] >= letters.length) {
      vcursors[hcursor] = 0;
    }
  }
}
function upload(gameState) {
  if (!hiscore.secret) {
    const scores = JSON.parse(localStorage.getItem("scores") || "{}");
    scores[gameState.name] = Math.max(scores[gameState.name] || 0, gameState.highScore);
    localStorage.setItem("scores", JSON.stringify(scores));
    return;
  }
  const url = hiscore.server + "/" + encodeURIComponent("snek " + chooseCategory(gameState.settings)) + "/" + gameState.name + "/" + gameState.highScore.toString();
  const options = {
    method: "POST",
    headers: {
      Authorization: hiscore.secret
    }
  };
  void fetch(url, options);
}
export function hscoreCache() {
  return hiscore;
}
