// IMPORTS
import KeyMap from './Keymap';
import Camera from './Camera';
import viewport from './Viewport';
import DefaultShader from './DefaultShader';
import MouseTracker from './MouseTracker';
import config from './config.json';
import loadMap, { Map } from './MapLoader';

// CANVAS SETUP
const canv = document.getElementById('canv') as HTMLCanvasElement;
const gl = canv.getContext('webgl2');
canv.onclick = () => canv.requestPointerLock();
viewport(gl);

// DECLARATIONS
const defaultShader = new DefaultShader(gl);
const cam = new Camera([0, 0, 0], [0, 0, 1], config.fov);
const mouse = new MouseTracker(canv);
let map: Map = null;
main();

// MAIN FUNCTION
async function main() {
  map = await loadMap(gl, defaultShader, 'map.json');
  gl.enable(gl.DEPTH_TEST);
  gl.useProgram(defaultShader.program);
  requestAnimationFrame(loop);
}

// GAME LOOP
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// UPDATE FUNCTION
function update() {

  // KEYBOARD CONTROLS
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

  if (KeyMap[16]) {
    cam.moveUp(-1);
  }

  if (KeyMap[32]) {
    cam.moveUp(1);
  }

  // MOUSE CONTROLS
  const mouseMove = mouse.getMovement();
  if (mouseMove.x !== 0) {
    cam.rotateRight(mouseMove.x / 100);
    mouseMove.x = 0;
  }

  if (mouseMove.y !== 0) {
    cam.rotateUp(-mouseMove.y / 100);
    mouseMove.y = 0;
  }
}

// DRAW FUNCTION
function draw() {
  gl.clearColor(0.4, 0.4, 0.45, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  for (const object of map) {
    gl.bindVertexArray(object.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, object.vertPos);
    gl.bindBuffer(gl.ARRAY_BUFFER, object.vertNormals);
    gl.bindBuffer(gl.ARRAY_BUFFER, object.texCoords);
    gl.bindTexture(gl.TEXTURE_2D, object.texture);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.indicies);
    gl.uniformMatrix4fv(defaultShader.uniform.mViewProjection, false, cam.getViewProjectionMatrix());

    for (const instance of object.instances) {
      gl.uniformMatrix4fv(defaultShader.uniform.mWorld, false, instance);
      gl.drawElements(gl.TRIANGLES, object.indexCount, gl.UNSIGNED_SHORT, 0);
    }
  }
}
