import vert from './shaders/vertex.glsl';
import frag from './shaders/fragment.glsl';
import { mat4, glMatrix } from 'gl-matrix';

const canv = document.getElementById('canv') as HTMLCanvasElement;
const gl = canv.getContext('webgl');
let vertexShader = gl.createShader(gl.VERTEX_SHADER);
let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

gl.shaderSource(vertexShader, vert);
gl.shaderSource(fragmentShader, frag);
gl.compileShader(vertexShader);
gl.compileShader(fragmentShader);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

const verts = [
  // X   Y   Z    R    G     B
  0.0, 0.5, 0.0, 1.0, 0.2, 0.0,
  -0.5, -0.5, 0.0, 0.0, 1.0, 0.0,
  0.5, -0.5, 0.0, 0.0, 0.3, 1.0
];
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
const colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
gl.vertexAttribPointer(
  positionAttribLocation,
  3,
  gl.FLOAT,
  false,
  6 * Float32Array.BYTES_PER_ELEMENT,
  0
);
gl.vertexAttribPointer(
  colorAttribLocation,
  3,
  gl.FLOAT,
  false,
  6 * Float32Array.BYTES_PER_ELEMENT,
  3 * Float32Array.BYTES_PER_ELEMENT
);

gl.enableVertexAttribArray(positionAttribLocation);
gl.enableVertexAttribArray(colorAttribLocation);
gl.useProgram(program);

const mWorldLocation = gl.getUniformLocation(program, 'mWorld');
const mViewLocation = gl.getUniformLocation(program, 'mView');
const mProjLocation = gl.getUniformLocation(program, 'mProj');

const mWorld = new Float32Array(16);
const mView = new Float32Array(16);
const mProj = new Float32Array(16);
mat4.identity(mWorld);
mat4.lookAt(mView, [0, 0, -1.5], [0, 0, 0], [0, 1, 0]);
mat4.perspective(mProj, glMatrix.toRadian(70), canv.width / canv.height, 0.1, 1000);

gl.uniformMatrix4fv(mWorldLocation, false, mWorld);
gl.uniformMatrix4fv(mViewLocation, false, mView);
gl.uniformMatrix4fv(mProjLocation, false, mProj);

let angle = 0;
const identity = new Float32Array(16);
mat4.identity(identity);
requestAnimationFrame(loop);

function loop() {
  angle = performance.now() / 1000 / 6 * 2 * Math.PI;
  mat4.rotate(mWorld, identity, angle, [0, 1, 0]);
  gl.uniformMatrix4fv(mWorldLocation, false, mWorld);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  requestAnimationFrame(loop);
}
