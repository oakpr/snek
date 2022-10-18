import {mat4} from 'gl-matrix';
import type {GameState} from 'src';

// Mostly copied from https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API

// The source of the WebGL program's vertex shader.
// Not terribly interesting...
const vsSource = `
	attribute vec4 aVertexPosition;

	uniform mat4 uModelViewMatrix;
	uniform mat4 uProjectionMatrix;

	void main() {
		gl_Position = aVertexPosition;
	}
`;

// The source of the WebGL program's fragment shader.
const fsSource = `
	uniform highp float timer;

	void main() {
		lowp float t = timer;

		// Initialize the internal coordinates to match the fragment coordinates.
		highp float y = gl_FragCoord.y;
		highp float x = gl_FragCoord.x;

		x += sin((y / 20.0) + timer) * 50.0 + cos(y - timer / 2.0) * 2.0 + cos(x / sin(timer * cos(y + timer)));

		lowp float hue1 = timer + sin((x + y + timer) / 10.0);
		lowp float hue2 = timer + cos((x - y) / 10.0);

		bool row = mod(y * 240.0, 2.0) < 0.5;
		lowp float r = 0.0;
		lowp float g = 0.0;
		lowp float b = 0.0;
		if (row) {
			r = 0.5 + (0.5 * sin(hue1));
			g = 0.5 + (0.5 * sin(hue1 + (2.0 * 3.14 / 3.0)));
			b = 0.5 + (0.5 * sin(hue1 + (4.0 * 3.14 / 3.0)));
		} else {
			r = 0.5 + (0.5 * sin(hue2));
			g = 0.5 + (0.5 * sin(hue2 + (2.0 * 3.14 / 3.0)));
			b = 0.5 + (0.5 * sin(hue2 + (4.0 * 3.14 / 3.0)));
		}
		// Write the rgb color to the screen.
		gl_FragColor = vec4(r, g, b, 1.0);
	}
`;

// The result of the initShader function.
const bgres = initShader();
// The background canvas, context, program info, and texture buffers.
// These are used in render_shader.
let [bgcanvas, bgctx, bgpi, bgbuf]: [HTMLCanvasElement, WebGLRenderingContext, ProgramInfo, WebGlBuffers] = [undefined, undefined, undefined, undefined];
if (bgres) {
	[bgcanvas, bgctx, bgpi, bgbuf] = bgres;
}

/**
 * Start the background render loop.
 * @param game_state Pass a reference to the game state; the background needs to check enableBg every frame.
 */
export function background(game_state: GameState) {
	if (
		// If bgctx is a WebGL context (as opposed to undefined) and...
		bgctx instanceof WebGLRenderingContext && game_state.settings.flashy
		// If the user is willing to see animations...
		&& !window.matchMedia('(prefers-reduced-motion: reduce)').matches
	) {
		// Draw the shader!
		renderShader(bgctx, bgpi, bgbuf, game_state.clock / 1000);
	}

	// Wait 1/30 of a second before running again.
	setTimeout(() => {
		background(game_state);
	}, 33);
}

// Unsure exactly how this works, it's something that was in the MDN tutorial.
type ProgramInfo = {
	program: WebGLProgram;
	attribLocations: {
		vertexPosition: GLint;
	};
	uniformLocations: {
		projectionMatrix: WebGLUniformLocation;
		modelViewMatrix: WebGLUniformLocation;
	};
};
// Unsure exactly how this works, it's something that was in the MDN tutorial.
type WebGlBuffers = {
	position: WebGLBuffer;
};

// Sets up the shaders, or returns false if there was a failure.
function initShader(): [HTMLCanvasElement, WebGLRenderingContext, ProgramInfo, WebGlBuffers] | false {
	if (typeof OffscreenCanvas === 'undefined') {
		return false;
	}

	const canvas: HTMLCanvasElement = document.querySelector('#bg');
	const gl = canvas.getContext('webgl');
	if (!gl) {
		return false;
	}

	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
	if (!(vertexShader && fragmentShader)) {
		return false;
	}

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.error(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
		return false;
	}

	const programInfo: ProgramInfo = {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
		},
	};

	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	const positions = [
		1,
		1,
		-1,
		1,
		1,
		-1,
		-1,
		-1,
	];
	gl.bufferData(gl.ARRAY_BUFFER,
		new Float32Array(positions),
		gl.STATIC_DRAW);
	return [canvas, gl, programInfo, {position: buffer}];
}

function renderShader(gl: WebGLRenderingContext, programInfo: ProgramInfo, buffers: WebGlBuffers, timer: number) {
	// Update the shader timer
	const timeLocation = gl.getUniformLocation(programInfo.program, 'timer');
	gl.uniform1f(timeLocation, Math.sin(timer / 30) * 30);

	gl.clearColor(0, 0, 0, 1); // Clear to black, fully opaque
	gl.clearDepth(1); // Clear everything
	gl.enable(gl.DEPTH_TEST); // Enable depth testing
	gl.depthFunc(gl.LEQUAL); // Near things obscure far things

	// Clear the canvas before we start drawing on it.
	// eslint-disable-next-line no-bitwise
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Create a perspective matrix, a special matrix that is
	// used to simulate the distortion of perspective in a camera.
	// Our field of view is 45 degrees, with a width/height
	// ratio that matches the display size of the canvas
	// and we only want to see objects between 0.1 units
	// and 100 units away from the camera.

	const fieldOfView = 45 * Math.PI / 180; // In radians
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const zNear = 0.1;
	const zFar = 100;
	const projectionMatrix = mat4.create();

	// Note: glmatrix.js always has the first argument
	// as the destination to receive the result.
	mat4.perspective(projectionMatrix,
		fieldOfView,
		aspect,
		zNear,
		zFar);

	// Set the drawing position to the "identity" point, which is
	// the center of the scene.
	const modelViewMatrix = mat4.create();

	// Now move the drawing position a bit to where we want to
	// start drawing the square.

	mat4.translate(modelViewMatrix, // Destination matrix
		modelViewMatrix, // Matrix to translate
		[-0, 0, -6]); // Amount to translate

	// Tell WebGL how to pull out the positions from the position
	// buffer into the vertexPosition attribute.
	{
		const numberComponents = 2; // Pull out 2 values per iteration
		const type = gl.FLOAT; // The data in the buffer is 32bit floats
		const normalize = false; // Don't normalize
		const stride = 0; // How many bytes to get from one set of values to the next
		// 0 = use type and numComponents above
		const offset = 0; // How many bytes inside the buffer to start from
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
		gl.vertexAttribPointer(
			programInfo.attribLocations.vertexPosition,
			numberComponents,
			type,
			normalize,
			stride,
			offset);
		gl.enableVertexAttribArray(
			programInfo.attribLocations.vertexPosition);
	}

	// Tell WebGL to use our program when drawing

	gl.useProgram(programInfo.program);

	// Set the shader uniforms

	gl.uniformMatrix4fv(
		programInfo.uniformLocations.projectionMatrix,
		false,
		projectionMatrix);
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.modelViewMatrix,
		false,
		modelViewMatrix);

	{
		const offset = 0;
		const vertexCount = 4;
		gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
	}
}

function loadShader(gl: WebGLRenderingContext, type: number, source: string) {
	const shader = gl.createShader(type);
	// Send the source to the shader object
	gl.shaderSource(shader, source);
	// Compile the shader program
	gl.compileShader(shader);
	// See if it compiled successfully
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
		gl.deleteShader(shader);
		return false;
	}

	return shader;
}
