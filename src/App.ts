// IMPORTS
import KeyMap from './Keymap';
import Camera from './Camera';
import viewport from './Viewport';
import DefaultShader from './shaders/DefaultShader';
import MouseTracker from './MouseTracker';
import config from './config.json';
import loadMap, { Map, LightMap, Fog } from './MapLoader';
import Skybox from './Skybox';
import SkyboxShader from './shaders/SkyboxShader';

// DOM SETUP
const canv = document.getElementById('canv') as HTMLCanvasElement;
const loading = document.getElementById('loading');
const gl = canv.getContext('webgl2');
canv.onclick = () => canv.requestPointerLock();
viewport(gl);

// DECLARATIONS
const defaultShader = new DefaultShader(gl);
const skyboxShader = new SkyboxShader(gl);
const cam = new Camera([0, 0, 0], [0, 0, 1], config.fov);
const mouse = new MouseTracker(canv);
let map: Map = null;
let skybox: Skybox = null;
let lights: LightMap = null;
let fog: Fog = null;
main();

// MAIN FUNCTION
async function main() {
  const loaded = await loadMap(gl, defaultShader, skyboxShader, 'map.json');
  map = loaded.objects;
  skybox = loaded.skybox;
  lights = loaded.lights;
  fog = loaded.fog;

  loading.style.display = 'none';
  gl.enable(gl.DEPTH_TEST);
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
  let moveSpeed = 1;

  if (KeyMap[16]) {
    moveSpeed = 2;
  }

  if (KeyMap[65]) {
    cam.moveRight(-moveSpeed);
  }

  if (KeyMap[68]) {
    cam.moveRight(moveSpeed);
  }

  if (KeyMap[87]) {
    cam.moveForward(moveSpeed);
  }

  if (KeyMap[83]) {
    cam.moveForward(-moveSpeed);
  }

  if (KeyMap[17]) {
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

  // CLEAR SCREEN
  gl.clearColor(0.4, 0.4, 0.45, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // ENVIROMENT
  gl.useProgram(defaultShader.program);
  for (const object of map) {

    // Mesh
    gl.bindVertexArray(object.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, object.vertPos);
    gl.bindBuffer(gl.ARRAY_BUFFER, object.vertNormals);

    // Texture
    gl.bindBuffer(gl.ARRAY_BUFFER, object.texCoords);
    gl.bindTexture(gl.TEXTURE_2D, object.texture);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.indicies);

    // Transformation Matrices
    gl.uniformMatrix4fv(defaultShader.uniform.mView, false, cam.getViewMatrix());
    gl.uniformMatrix4fv(defaultShader.uniform.mProjection, false, cam.getProjectionMatrix());

    // Direction Lighting
    gl.uniform3fv(defaultShader.uniform.ambient, lights.ambient);
    gl.uniform3fv(defaultShader.uniform.sunInt, lights.directional.intensity);
    gl.uniform3fv(defaultShader.uniform.sunPos, lights.directional.position);

    // Specular Lighting
    gl.uniform3fv(defaultShader.uniform.cameraPos, cam.getPosition());
    gl.uniform1f(defaultShader.uniform.shininess, object.shininess);
    gl.uniform1f(defaultShader.uniform.specCoef, object.specCoef);

    // Fog
    gl.uniform1f(defaultShader.uniform.fogDensity, fog.density);
    gl.uniform3fv(defaultShader.uniform.fogColor, fog.color);

    // Draw
    for (const instance of object.instances) {
      gl.uniformMatrix4fv(defaultShader.uniform.mWorld, false, instance);
      gl.drawElements(gl.TRIANGLES, object.indexCount, gl.UNSIGNED_SHORT, 0);
    }
  }

  // SKYBOX
  gl.useProgram(skyboxShader.program);
  skybox.draw(cam);
}
