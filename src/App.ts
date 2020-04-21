// IMPORTS
import KeyMap from './Keymap';
import { mat4, glMatrix } from 'gl-matrix';
import { downloadMeshes, MeshMap } from '../node_modules/webgl-obj-loader/src/index';
import Camera from './Camera';
import viewport from './Viewport';
import DefaultShader from './DefaultShader';
import MouseTracker from './MouseTracker';
import config from './config.json';

// CANVAS SETUP
const canv = document.getElementById('canv') as HTMLCanvasElement;
const gl = canv.getContext('webgl2');
canv.onclick = () => canv.requestPointerLock();
viewport(gl);

// DECLARATIONS
const defaultShader = new DefaultShader(gl);
const cam = new Camera([30, 5, 25], [0, 0, 1], config.fov);
const mouse = new MouseTracker(canv);

const texture = new Image();
texture.src = 'assets/terrain.png';
const texture2 = new Image();
texture2.src = 'assets/terrain_red.png';
texture.onload = () => texture2.onload = () => downloadMeshes({
  dog: 'assets/terrain.obj'
}, main, {});

function main(meshes: MeshMap) {
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshes.dog.vertices), gl.STATIC_DRAW);

  gl.vertexAttribPointer(
    defaultShader.attrib.vertPosition,
    3,
    gl.FLOAT,
    false,
    3 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.enableVertexAttribArray(defaultShader.attrib.vertPosition);

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshes.dog.textures), gl.STATIC_DRAW);

  gl.vertexAttribPointer(
    defaultShader.attrib.texCoords,
    2,
    gl.FLOAT,
    false,
    2 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.enableVertexAttribArray(defaultShader.attrib.texCoords);

  const normalsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshes.dog.vertexNormals), gl.STATIC_DRAW);

  gl.vertexAttribPointer(
    defaultShader.attrib.vertNormal,
    3,
    gl.FLOAT,
    false,
    3 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.enableVertexAttribArray(defaultShader.attrib.vertNormal);

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

  const dogTex2 = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, dogTex2);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    texture2
  );

  gl.enable(gl.DEPTH_TEST);
  gl.useProgram(defaultShader.program);

  const mWorldLocation = defaultShader.uniform.mWorld;
  const mViewProjectionLocation = defaultShader.uniform.mViewProjection;

  const mWorld = new Float32Array(16);
  mat4.identity(mWorld);
  mat4.rotate(mWorld, mWorld, glMatrix.toRadian(-90), [1, 0, 0]);
  mat4.translate(mWorld, mWorld, [-20, 0, 0]);

  const identity = new Float32Array(16);
  mat4.identity(identity);
  requestAnimationFrame(loop);

  let tex = false;
  let frame = 0;
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

    const mouseMove = mouse.getMovement();
    if (mouseMove.x !== 0) {
      cam.rotateRight(mouseMove.x / 100);
      mouseMove.x = 0;
    }

    if (mouseMove.y !== 0) {
      cam.rotateUp(-mouseMove.y / 100);
      mouseMove.y = 0;
    }

    if (tex) {
      gl.bindTexture(gl.TEXTURE_2D, dogTex);
    } else {
      gl.bindTexture(gl.TEXTURE_2D, dogTex2);
    }

    if (++frame === 30) {
      frame = 0;
      tex = !tex;
    }

    gl.uniformMatrix4fv(mViewProjectionLocation, false, cam.getViewProjectionMatrix());
    gl.uniformMatrix4fv(mWorldLocation, false, mWorld);
    gl.clearColor(0.4, 0.4, 0.45, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, meshes.dog.indices.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(loop);
  }
}
