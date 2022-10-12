import type {GameState} from 'src';

// `el` stores the track's element, `cond` returns its target volume from 0-1.
const tracks: Array<{el: HTMLAudioElement; cond: (s: GameState) => number}> = [
	{
		el: document.querySelector('audio#synth'),
		cond(state: GameState) {
			return state.gameStarted ? 1 : 0.5;
		},
	},
	{
		el: document.querySelector('audio#bass'),
		cond(state: GameState) {
			return state.gameStarted ? 0.4 : 0;
		},
	},
	{
		el: document.querySelector('audio#drums'),
		cond(state: GameState) {
			return 0;
		},
	},
	{
		el: document.querySelector('audio#lead'),
		cond(state: GameState) {
			return state.gameStarted ? 1 : 0;
		},
	},
];

for (const track of tracks) {
	void track.el.play();
}

// Tick the music 10 times per second.
export default function music(gameState: GameState) {
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
