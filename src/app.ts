import vert from './shaders/vertex.glsl';
import frag from './shaders/fragment.glsl';
import { mat4, glMatrix } from 'gl-matrix';

const canv = document.getElementById('canv') as HTMLCanvasElement;
const gl = canv.getContext('webgl');
const texture = new Image();
texture.src = 'assets/cube.jpg';
let vertexShader = gl.createShader(gl.VERTEX_SHADER);
let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

gl.shaderSource(vertexShader, vert);
gl.shaderSource(fragmentShader, frag);
gl.compileShader(vertexShader);
gl.compileShader(fragmentShader);
texture.onload = main;

function main() {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const verts = [
    // X, Y, Z         U, V
    // Top
    -1.0, 1.0, -1.0,   1, 1,
    -1.0, 1.0, 1.0,    1, 0,
    1.0, 1.0, 1.0,     0, 0,
    1.0, 1.0, -1.0,    0, 1,

    // Left
    -1.0, 1.0, 1.0,    1, 0,
    -1.0, -1.0, 1.0,   1, 1,
    -1.0, -1.0, -1.0,  0, 1,
    -1.0, 1.0, -1.0,   0, 0,

    // Right
    1.0, 1.0, 1.0,    0, 0,
    1.0, -1.0, 1.0,   0, 1,
    1.0, -1.0, -1.0,  1, 1,
    1.0, 1.0, -1.0,   1, 0,

    // Front
    1.0, 1.0, 1.0,    1, 0,
    1.0, -1.0, 1.0,    1, 1,
    -1.0, -1.0, 1.0,    0, 1,
    -1.0, 1.0, 1.0,    0, 0,

    // Back
    1.0, 1.0, -1.0,    0, 0,
    1.0, -1.0, -1.0,    0, 1,
    -1.0, -1.0, -1.0,    1, 1,
    -1.0, 1.0, -1.0,    1, 0,

    // Bottom
    -1.0, -1.0, -1.0,   1, 1,
    -1.0, -1.0, 1.0,    1, 0,
    1.0, -1.0, 1.0,     0, 0,
    1.0, -1.0, -1.0,    0, 1,
  ];

  const boxIndices = [
    // Top
    0, 1, 2,
    0, 2, 3,

    // Left
    5, 4, 6,
    6, 4, 7,

    // Right
    8, 9, 10,
    8, 10, 11,

    // Front
    13, 12, 14,
    15, 14, 12,

    // Back
    16, 17, 18,
    16, 18, 19,

    // Bottom
    21, 20, 22,
    22, 20, 23
  ];

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

  const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
  const texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
  gl.vertexAttribPointer(
    positionAttribLocation,
    3,
    gl.FLOAT,
    false,
    5 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.vertexAttribPointer(
    texCoordAttribLocation,
    2,
    gl.FLOAT,
    false,
    5 * Float32Array.BYTES_PER_ELEMENT,
    3 * Float32Array.BYTES_PER_ELEMENT
  );

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(texCoordAttribLocation);

  const boxTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    texture
  );

  gl.enable(gl.DEPTH_TEST);
  gl.useProgram(program);

  const mWorldLocation = gl.getUniformLocation(program, 'mWorld');
  const mViewLocation = gl.getUniformLocation(program, 'mView');
  const mProjLocation = gl.getUniformLocation(program, 'mProj');

  const mWorld = new Float32Array(16);
  const mView = new Float32Array(16);
  const mProj = new Float32Array(16);
  mat4.identity(mWorld);
  mat4.lookAt(mView, [0, 0, -4], [0, 0, 0], [0, 1, 0]);
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
    mat4.rotate(mWorld, identity, glMatrix.toRadian(-17), [1, 0, 0]);
    mat4.rotate(mWorld, mWorld, angle, [0, 1, 0]);
    gl.uniformMatrix4fv(mWorldLocation, false, mWorld);

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(loop);
  }
}
