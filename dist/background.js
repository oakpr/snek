import {mat4} from "../_snowpack/pkg/gl-matrix.js";
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
let [bgcanvas, bgctx, bgpi, bgbuf] = [void 0, void 0, void 0, void 0];
if (bgres) {
  [bgcanvas, bgctx, bgpi, bgbuf] = bgres;
}
export function background(game_state, ctx) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !bgres || !game_state.settings.enableBg) {
    ctx.fillStyle = "rgb(32, 32, 32)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (!bgres && game_state.settings.enableBg) {
      ctx.strokeStyle = "white";
      ctx.textAlign = "center";
      ctx.strokeText("webgl broken?", ctx.canvas.width / 2, ctx.canvas.height / 2);
    }
  } else {
    renderShader(bgctx, bgpi, bgbuf, game_state.clock / 1e3);
    ctx.drawImage(bgcanvas, 0, 0);
  }
}
function nicerModulo(n, quot) {
  while (n > quot) {
    n -= quot;
  }
  while (n < 0) {
    n += quot;
  }
  return n;
}
function initShader() {
  if (typeof OffscreenCanvas === "undefined") {
    return false;
  }
  const canvas = new OffscreenCanvas(480, 480);
  const gl = canvas.getContext("webgl");
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
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition")
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix")
    }
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
    -1
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  return [canvas, gl, programInfo, {position: buffer}];
}
function renderShader(gl, programInfo, buffers, timer) {
  const timeLocation = gl.getUniformLocation(programInfo.program, "timer");
  gl.uniform1f(timeLocation, Math.sin(timer / 30) * 30);
  gl.clearColor(0, 0, 0, 1);
  gl.clearDepth(1);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  const fieldOfView = 45 * Math.PI / 180;
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100;
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
  const modelViewMatrix = mat4.create();
  mat4.translate(modelViewMatrix, modelViewMatrix, [-0, 0, -6]);
  {
    const numberComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numberComponents, type, normalize, stride, offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
  }
  gl.useProgram(programInfo.program);
  gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
    gl.deleteShader(shader);
    return false;
  }
  return shader;
}
