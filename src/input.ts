export const maxPlayers = 2;

export const players: Array<Player | undefined> = [];

const keysPressedMap: Record<string, boolean> = {};
document.addEventListener('keydown', event => {
	keysPressedMap[event.key.toLocaleLowerCase()] = true;
});
document.addEventListener('keyup', event => {
	keysPressedMap[event.key.toLocaleLowerCase()] = false;
});

export class Player {
	controllerId: number;
	movement: [number, number];
	buttons: boolean[];
	associatedEntity: number;
	disconnected: boolean;

	constructor(controller: Gamepad | undefined) {
		if (controller) {
			this.controllerId = controller.index;
			// https://w3c.github.io/gamepad/#remapping
			this.movement = [controller.axes[0], controller.axes[1]];
			this.buttons = [controller.buttons[1].pressed, controller.buttons[0].pressed];
			this.associatedEntity = 0; // When the player is implemented, add this
			this.disconnected = false;
		} else {
			this.controllerId = -1;
			this.movement = [0, 0];
			this.buttons = [keysPressedMap.z, keysPressedMap.x];
			this.associatedEntity = 0;
			this.disconnected = false;
		}
	}

	tick() {
		if (this.controllerId >= 0) {
			// Find the controller, or die if it doesn't exist
			let controller: Gamepad;
			for (const c of navigator.getGamepads()) {
				if (c === null) {
					// Chrome returns null sometimes i heard
					continue;
				}

				if (c.index === this.controllerId) {
					controller = c;
					break;
				}
			}

			// If disconnected, die
			if (!controller) {
				this.disconnected = true;
				return;
			}

			// Write inputs
			this.movement = [controller.axes[0], controller.axes[1]];
			this.buttons = [controller.buttons[1].pressed, controller.buttons[0].pressed];

			// Write d-pad inputs
			this.movement[0] -= controller.buttons[14] ? 1 : 0;
			this.movement[0] += controller.buttons[15] ? 1 : 0;
			this.movement[1] -= controller.buttons[12] ? 1 : 0;
			this.movement[1] += controller.buttons[13] ? 1 : 0;

			// If 'select' or the equivalent button is pressed, die
			if (this.buttons[8]) {
				this.disconnected = true;
			}
		} else {
			this.movement = [0, 0];
			this.movement[0] -= Number(keysPressedMap.arrowleft ? 1 : 0);
			this.movement[0] += Number(keysPressedMap.arrowright ? 1 : 0);
			this.movement[1] -= Number(keysPressedMap.arrowup ? 1 : 0);
			this.movement[1] += Number(keysPressedMap.arrowdown ? 1 : 0);
			this.buttons = [keysPressedMap.z || false, keysPressedMap.x || false];

			if (keysPressedMap.escape) {
				this.disconnected = true;
			}
		}

		// Normalize movement to len == 1
		const length = Math.sqrt((this.movement[0] ** 2) + (this.movement[1] ** 2));
		this.movement[0] /= length;
		this.movement[1] /= length;
	}
}

export function tickPlayerInput() {
	// Look for new controllers
	// eslint-disable-next-line unicorn/prefer-set-has
	const existingPlayers: number[] = players.filter(Boolean).map(v => v.controllerId);
	const newControllers = navigator.getGamepads().filter(Boolean).filter(v => !existingPlayers.includes(v.index)).filter(v => v.buttons.some(Boolean)).map(v => new Player(v));
	if (!existingPlayers.includes(-1)) {
		let keyboardActive: boolean;
		for (const key of ['z', 'x', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']) {
			keyboardActive = keyboardActive || keysPressedMap[key];
		}

		if (keyboardActive) {
			newControllers.push(new Player(null));
		}
	}

	for (const player of newControllers) {
		const emptySlot = players.indexOf(null);
		if (emptySlot !== -1) {
			players[emptySlot] = player;
		} else if (players.length < maxPlayers) {
			players.push(player);
		} else {
			console.log('can\'t add new player');
			continue;
		}

		console.log(players);
	}

	for (const player of players) {
		if (!player) {
			continue;
		}

		// Tick players
		player.tick();
		// Remove a player if they are disconnecting
		if (player.disconnected) {
			console.log(`dropped player ${player.controllerId}`);
			players[players.indexOf(player)] = null;
			continue;
		}
	}
}