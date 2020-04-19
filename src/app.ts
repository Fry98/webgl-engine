import vert from './shaders/vertex.glsl';
import frag from './shaders/fragment.glsl';
import KeyMap from './keymap';
import { mat4, glMatrix } from 'gl-matrix';
import { downloadMeshes, MeshMap } from '../node_modules/webgl-obj-loader/src/index';
import Camera from './camera';
import viewport from './viewport';

const canv = document.getElementById('canv') as HTMLCanvasElement;
const gl = canv.getContext('webgl2');
const mouseMove = {
  x: 0,
  y: 0
};
let vertexShader = gl.createShader(gl.VERTEX_SHADER);
let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

gl.shaderSource(vertexShader, vert);
gl.shaderSource(fragmentShader, frag);
gl.compileShader(vertexShader);
gl.compileShader(fragmentShader);

const cam = new Camera([30, 5, 25], [0, 0, 1], 70);
viewport(gl);
canv.onclick = () => canv.requestPointerLock();
const texture = new Image();
texture.src = 'assets/terrain.png';

document.onmousemove = e => {
  if (document.pointerLockElement !== canv) return;
  mouseMove.x += e.movementX;
  mouseMove.y += e.movementY;
};

texture.onload = () => downloadMeshes({
  dog: 'assets/terrain.obj'
}, main, {});

function main(meshes: MeshMap) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshes.dog.vertices), gl.STATIC_DRAW);

  const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
  gl.vertexAttribPointer(
    positionAttribLocation,
    3,
    gl.FLOAT,
    false,
    3 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.enableVertexAttribArray(positionAttribLocation);

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshes.dog.textures), gl.STATIC_DRAW);

  const texCoordLocation = gl.getAttribLocation(program, 'vertTexCoord');
  gl.vertexAttribPointer(
    texCoordLocation,
    2,
    gl.FLOAT,
    false,
    2 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.enableVertexAttribArray(texCoordLocation);

  const normalsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshes.dog.vertexNormals), gl.STATIC_DRAW);

  const normalAttribLocation = gl.getAttribLocation(program, 'vertNormal');
  gl.vertexAttribPointer(
    normalAttribLocation,
    3,
    gl.FLOAT,
    false,
    3 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.enableVertexAttribArray(normalAttribLocation);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(meshes.dog.indices), gl.STATIC_DRAW);

  const dogTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, dogTex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    texture
  );

  gl.enable(gl.DEPTH_TEST);
  gl.useProgram(program);

  const mWorldLocation = gl.getUniformLocation(program, 'mWorld');
  const mViewProjectionLocation = gl.getUniformLocation(program, 'mViewProjection');

  const mWorld = new Float32Array(16);
  mat4.identity(mWorld);
  mat4.rotate(mWorld, mWorld, glMatrix.toRadian(-90), [1, 0, 0]);
  mat4.translate(mWorld, mWorld, [-20, 0, 0]);

  const identity = new Float32Array(16);
  mat4.identity(identity);
  requestAnimationFrame(loop);

  function loop() {
    if (KeyMap[65]) {
      cam.moveRight(-1);
    }

    if (KeyMap[68]) {
      cam.moveRight(1);
    }

    if (KeyMap[87]) {
      cam.moveForward(1);
    }

    if (KeyMap[83]) {
      cam.moveForward(-1);
    }

    if (mouseMove.x !== 0) {
      cam.rotateRight(mouseMove.x / 100);
      mouseMove.x = 0;
    }

    if (mouseMove.y !== 0) {
      cam.rotateUp(-mouseMove.y / 100);
      mouseMove.y = 0;
    }

    gl.uniformMatrix4fv(mViewProjectionLocation, false, cam.getViewProjectionMatrix());
    gl.uniformMatrix4fv(mWorldLocation, false, mWorld);
    gl.clearColor(0.4, 0.4, 0.45, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, meshes.dog.indices.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(loop);
  }
}
