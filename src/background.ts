import {mat4} from 'gl-matrix';
import type {GameState} from 'src';

// Mostly copied from https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API

const vsSource = `
	attribute vec4 aVertexPosition;

	uniform mat4 uModelViewMatrix;
	uniform mat4 uProjectionMatrix;

	void main() {
		gl_Position = aVertexPosition;
	}
`;
const fsSource = `
	uniform highp float timer;

	void main() {
		highp float y = gl_FragCoord.y;
		highp float x = gl_FragCoord.x;
		y += (sin(((x / 10.0) + (timer * 3.0)) * (10.0 + sin(timer)) / 10.0)) * 3.0 + (timer * 30.0);
		x -= sin((y / 20.0) + (timer / 5.0) + (sin(y/5.0))) * 500.0;
		highp float offset_timer = (timer / 5.0) + (sin(y/5.0) + (timer / -0.5) / 5.0) + (cos(x / 5.0) + (timer / 10.0)) / 15.0;
		lowp float r = 0.5 + (0.5 * sin(offset_timer));
		lowp float g = 0.5 + (0.5 * sin(offset_timer + (2.0 * 3.14 / 3.0)));
		lowp float b = 0.5 + (0.5 * sin(offset_timer + (4.0 * 3.14 / 3.0)));
		gl_FragColor = vec4(r, g, b, 1.0);
	}
`;

const bgTileSize = 12;

const bgres = initShader();
let [bgcanvas, bgctx, bgpi, bgbuf] = [undefined, undefined, undefined, undefined];
if (bgres) {
	[bgcanvas, bgctx, bgpi, bgbuf] = bgres;
}

export function background(game_state: GameState, ctx: CanvasRenderingContext2D) {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !bgres || !game_state.settings.enableBg) {
		ctx.fillStyle = 'rgb(32, 32, 32)';
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		if (!bgres && game_state.settings.enableBg) {
			ctx.strokeStyle = 'white';
			ctx.textAlign = 'center';
			ctx.strokeText('webgl broken?', ctx.canvas.width / 2, ctx.canvas.height / 2);
		}
	} else {
		renderShader(bgctx, bgpi, bgbuf, game_state.clock / 1000);
		ctx.drawImage(bgcanvas, 0, 0);
	}
}

function nicerModulo(n: number, quot: number): number {
	while (n > quot) {
		n -= quot;
	}

	while (n < 0) {
		n += quot;
	}

	return n;
}

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
type WebGlBuffers = {
	position: WebGLBuffer;
};

function initShader(): [OffscreenCanvas, WebGLRenderingContext, ProgramInfo, WebGlBuffers] | false {
	if (typeof OffscreenCanvas === 'undefined') {
		return false;
	}

	const canvas = new OffscreenCanvas(480, 480);
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
