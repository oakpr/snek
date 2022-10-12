const tracks = [
  {
    el: document.querySelector("audio#synth"),
    cond(state) {
      return state.gameStarted ? 1 : 0.5;
    }
  },
  {
    el: document.querySelector("audio#bass"),
    cond(state) {
      return state.gameStarted ? 0.4 : 0;
    }
  },
  {
    el: document.querySelector("audio#drums"),
    cond(state) {
      return 0;
    }
  },
  {
    el: document.querySelector("audio#lead"),
    cond(state) {
      return state.gameStarted ? 1 : 0;
    }
  }
];
export default function music(gameState) {
  const time = tracks[0].el.currentTime;
  for (const track of tracks) {
    const tgt = gameState.settings.music ? track.cond(gameState) : 0;
    track.el.volume = (track.el.volume + tgt) / 2;
    if (Math.abs(track.el.currentTime - tracks[0].el.currentTime) > 0.2) {
      track.el.fastSeek(tracks[0].el.currentTime);
    }
  }
  window.setTimeout(music, 100, gameState);
}
