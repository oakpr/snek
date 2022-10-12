import type {GameState} from 'src';

const actx = new AudioContext();

const eventsToStartAudio = [
	'keydown',
	'click',
];

for (const event of eventsToStartAudio) {
	document.addEventListener(event, async () => {
		await actx.resume();
	});
}

// `el` stores the track's element, `cond` returns its target volume from 0-1.
const tracks: Array<{location: string; node: AudioBufferSourceNode | undefined; gain: GainNode; cond: (s: GameState) => number}> = [
	{
		location: './mus/synth.ogg',
		node: undefined,
		gain: new GainNode(actx),
		cond(state: GameState) {
			return state.gameStarted ? 1 : 0.5;
		},
	},
	{
		location: './mus/bass.ogg',
		node: undefined,
		gain: new GainNode(actx),
		cond(state: GameState) {
			return state.gameStarted ? 1 : 0;
		},
	},
	{
		location: './mus/drums.ogg',
		node: undefined,
		gain: new GainNode(actx),
		cond(state: GameState) {
			return 0;
		},
	},
	{
		location: './mus/lead.ogg',
		node: undefined,
		gain: new GainNode(actx),
		cond(state: GameState) {
			return state.gameStarted ? 1 : 0;
		},
	},
];

(async () => {
	await actx.suspend();
	console.log('Setting up audio...');
	const trackPromises = tracks.map(async track => (async () => {
		console.log(`Fetching ${track.location}...`);
		const audioBuf = await fetch(track.location).then(async response => response.arrayBuffer());
		console.log(`Got audio data for ${track.location}, ${audioBuf.byteLength} bytes`);
		const audioData = await actx.decodeAudioData(audioBuf);
		track.node = new AudioBufferSourceNode(actx, {
			buffer: audioData,
			loop: true,
		});
		track.node.connect(track.gain);
		track.gain.connect(actx.destination);
	})());
	console.log(trackPromises);
	await Promise.all(trackPromises);
	console.log('Done setting up audio! Starting...');
	for (const track of tracks) {
		track.node.start();
	}

	await actx.resume();
})();

// Tick the music 10 times per second.
export default function music(gameState: GameState) {
	for (const track of tracks) {
		const tgt = gameState.settings.music ? track.cond(gameState) : 0;
		track.gain.gain.value = (track.gain.gain.value + tgt) / 2;
	}

	window.setTimeout(music, 100, gameState);
}
