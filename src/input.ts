import {Snake} from './snake.js';

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
	// The ID of the controller as known by the browser
	controllerId: number;
	// The controller's "movement" last frame
	oldMovement: [number, number];
	// The controller's "movement" this frame
	movement: [number, number];
	// Whether a given movement axis has changed
	movementDirty: [boolean, boolean];
	// The controller's buttons last frame
	oldButtons: boolean[];
	// The controller's buttons this frame
	buttons: boolean[];
	// Whether a given button has changed
	buttonsDirty: boolean[];
	// The "snake" associated with this player
	snake: Snake;
	// Whether this player disconnected this frame
	disconnected: boolean;

	constructor(controller: Gamepad | undefined) {
		if (controller) {
			this.controllerId = controller.index;
			// https://w3c.github.io/gamepad/#remapping
			this.movement = [controller.axes[0], controller.axes[1]];
			this.buttons = [controller.buttons[1].pressed, controller.buttons[0].pressed];
			this.snake = new Snake(controller.index); // When the player is implemented, add this
			this.disconnected = false;
		} else {
			this.controllerId = -1;
			this.movement = [0, 0];
			this.buttons = [keysPressedMap.z, keysPressedMap.x];
			this.snake = new Snake(-1);
			this.disconnected = false;
		}

		this.buttonsDirty = [false, false];
		this.movementDirty = [false, false];
		this.oldButtons = this.buttons;
		this.oldMovement = this.movement;
	}

	// eslint-disable-next-line complexity
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
		if (length > 0) {
			this.movement[0] /= length;
			this.movement[1] /= length;
		}

		// Detect if movement has changed
		this.movementDirty = [false, false];
		for (let i = 0; i < this.oldMovement.length; i++) {
			this.movementDirty[i] = sign(Math.round(this.oldMovement[i] * 0.6)) !== sign(Math.round(this.movement[i] * 0.6));
		}

		this.oldMovement = this.movement;
		// Detect if buttons have changed
		for (let i = 0; i < this.oldButtons.length; i++) {
			this.buttonsDirty[i] = this.oldButtons[i] !== this.buttons[i];
		}

		this.oldButtons = this.buttons;
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
			let player = new Player(null);
			newControllers.push(player);
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

function sign(n: number) {
	return n ? (n < 0 ? -1 : 1) : 0;
}
