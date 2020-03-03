import vert from './shaders/vertex.glsl';
import frag from './shaders/fragment.glsl';
import KeyMap from './keymap';
import { mat4, glMatrix } from 'gl-matrix';
import { downloadMeshes, MeshMap } from '../node_modules/webgl-obj-loader/src/index';

const canv = document.getElementById('canv') as HTMLCanvasElement;
const gl = canv.getContext('webgl');
let vertexShader = gl.createShader(gl.VERTEX_SHADER);
let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

gl.shaderSource(vertexShader, vert);
gl.shaderSource(fragmentShader, frag);
gl.compileShader(vertexShader);
gl.compileShader(fragmentShader);

const texture = new Image();
texture.src = 'assets/dog_diffuse.jpg';

texture.onload = () => downloadMeshes({
  dog: 'assets/dog.obj'
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
  const mViewLocation = gl.getUniformLocation(program, 'mView');
  const mProjLocation = gl.getUniformLocation(program, 'mProj');

  const mWorld = new Float32Array(16);
  const mView = new Float32Array(16);
  const mProj = new Float32Array(16);
  mat4.identity(mWorld);
  mat4.lookAt(mView, [0, 3, 5], [0, 1.5, 0], [0, 1, 0]);
  mat4.perspective(mProj, glMatrix.toRadian(70), canv.width / canv.height, 0.1, 1000);
  gl.uniformMatrix4fv(mProjLocation, false, mProj);

  const identity = new Float32Array(16);
  mat4.identity(identity);
  requestAnimationFrame(loop);

  function loop() {
    if (KeyMap[37]) {
      mat4.rotate(mWorld, mWorld, glMatrix.toRadian(2), [0, 1, 0]);
    }

    if (KeyMap[39]) {
      mat4.rotate(mWorld, mWorld, glMatrix.toRadian(-2), [0, 1, 0]);
    }

    if (KeyMap[38]) {
      mat4.translate(mView, mView, [0, 0, 0.1]);
    }

    if (KeyMap[40]) {
      mat4.translate(mView, mView, [0, 0, -0.1]);
    }

    if (KeyMap[87]) {
      mat4.rotate(mWorld, mWorld, glMatrix.toRadian(2), [1, 0, 0]);
    }

    if (KeyMap[83]) {
      mat4.rotate(mWorld, mWorld, glMatrix.toRadian(-2), [1, 0, 0]);
    }

    gl.uniformMatrix4fv(mViewLocation, false, mView);
    gl.uniformMatrix4fv(mWorldLocation, false, mWorld);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, meshes.dog.indices.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(loop);
  }
}
