// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
// eslint-disable-next-line unicorn/prefer-module
module.exports = {
	mount: {
		public: {url: '/', static: true},
		src: {url: '/dist'},
	},
	plugins: [
		'@snowpack/plugin-typescript',
		/* ... */
	],
	packageOptions: {
		/* ... */
	},
	devOptions: {
		/* ... */
	},
	buildOptions: {
		/* ... */
	},
};
