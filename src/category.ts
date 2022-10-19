import type {Settings} from './menu';

export function chooseCategory(settings: Settings): string {
	const extensions = new Array<string>();

	if ((settings.gridHeight * settings.gridWidth) > 100) {
		extensions.push('Massive');
	} else if ((settings.gridHeight * settings.gridWidth) < 100) {
		extensions.push('Micro');
	}

	if (settings.wrap && !settings.autoMode) {
		extensions.push('Toroidal');
	}

	if (settings.fast) {
		if (settings.waitForFrame) {
			extensions.push('Hyper');
		} else {
			extensions.push('Benchmark');
		}
	}

	if (settings.autoMode) {
		if (settings.fast) {
			extensions.push('Idle Game');
		} else {
			extensions.push('Button-Masher');
		}
	}

	if (extensions.length > 0) {
		return extensions.join(' ');
	}

	return 'Vanilla';
}
