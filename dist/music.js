const actx = new AudioContext();
const eventsToStartAudio = [
  "keydown",
  "click"
];
for (const event of eventsToStartAudio) {
  document.addEventListener(event, async () => {
    await actx.resume();
  });
}
const tracks = [
  {
    track: "./mus/synth.ogg",
    node: void 0,
    gain: new GainNode(actx),
    cond(state) {
      return state.gameStarted ? 1 : 0.5;
    }
  },
  {
    track: "./mus/bass.ogg",
    node: void 0,
    gain: new GainNode(actx),
    cond(state) {
      return state.gameStarted ? 1 : 0;
    }
  },
  {
    track: "./mus/drums.ogg",
    node: void 0,
    gain: new GainNode(actx),
    cond(state) {
      return 0;
    }
  },
  {
    track: "./mus/lead.ogg",
    node: void 0,
    gain: new GainNode(actx),
    cond(state) {
      return state.gameStarted ? 1 : 0;
    }
  }
];
(async () => {
  await actx.suspend();
  console.log("Setting up audio...");
  const trackPromises = tracks.map(async (track) => (async () => {
    console.log(`Fetching ${track.track}...`);
    const audioBuf = await fetch(track.track).then(async (response) => response.arrayBuffer());
    console.log(`Got audio data for ${track.track}, ${audioBuf.byteLength} bytes`);
    const audioData = await actx.decodeAudioData(audioBuf);
    track.node = new AudioBufferSourceNode(actx, {
      buffer: audioData,
      loop: true
    });
    track.node.connect(track.gain);
    track.gain.connect(actx.destination);
  })());
  console.log(trackPromises);
  await Promise.all(trackPromises);
  console.log("Done setting up audio! Starting...");
  for (const track of tracks) {
    track.node.start();
  }
  await actx.resume();
})();
export default function music(gameState) {
  for (const track of tracks) {
    const tgt = gameState.settings.music ? track.cond(gameState) : 0;
    track.gain.gain.value = (track.gain.gain.value + tgt) / 2;
  }
  window.setTimeout(music, 100, gameState);
}
