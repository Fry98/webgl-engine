// IMPORTS
import { glMatrix } from 'gl-matrix';
import KeyMap from './Keymap';
import Camera from './Camera';
import viewport from './Viewport';
import DefaultShader from './shaders/DefaultShader';
import MouseTracker from './MouseTracker';
import loadMap, { Map, LightMap, Fog, Collisions, loadImage } from './MapLoader';
import Skybox from './Skybox';
import SkyboxShader from './shaders/SkyboxShader';
import ColliderShader from './shaders/ColliderShader';
import config from './config.json';
import GuiRenderer from './GuiRenderer';
import GuiShader from './shaders/GuiShader';

// DOM SETUP
const canv = document.getElementById('canv') as HTMLCanvasElement;
const loading = document.getElementById('loading');
const gl = canv.getContext('webgl2');
canv.onclick = () => canv.requestPointerLock();
viewport(gl);

// SHADERS
const defaultShader = new DefaultShader(gl);
const skyboxShader = new SkyboxShader(gl);
const colliderShader = new ColliderShader(gl);
const guiShader = new GuiShader(gl);

// DECLARATIONS
const mouse = new MouseTracker(canv);
const flashlightInnerAngle = glMatrix.toRadian(config.flashlight.inner);
const flashlightOuterAngle = glMatrix.toRadian(config.flashlight.outer);
let cam: Camera = null;
let map: Map = null;
let skybox: Skybox = null;
let lights: LightMap = null;
let fog: Fog = null;
let collisions: Collisions = null;
let guiRenderer: GuiRenderer = null;
let flashlightOn = true;
main();

// MAIN FUNCTION
async function main() {
  try {
    const loaded = await loadMap(gl, defaultShader, skyboxShader, colliderShader, 'map.json');
    cam = loaded.camera;
    map = loaded.objects;
    skybox = loaded.skybox;
    lights = loaded.lights;
    fog = loaded.fog;
    collisions = {
      draw: false,
      boxes: loaded.boxes
    };

    guiRenderer = new GuiRenderer(gl, guiShader, await loadImage('cursor.png'));
    loading.style.display = 'none';
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    requestAnimationFrame(loop);
  } catch (e) {
    loading.innerHTML = 'ERROR';
    setTimeout(() => {
      alert(e.message);
    }, 0);
  }
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
    cam.moveUp(-0.7);
  }

  if (KeyMap[32]) {
    cam.moveUp(0.7);
  }

  // CAMERA COLLISIONS
  collisions.boxes.forEach(box => {
    if (box.isColliding(cam)) cam.revert();
  });
  cam.persist();

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
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // ENVIROMENT
  gl.useProgram(defaultShader.program);

  // Flashlight
  gl.uniform3fv(defaultShader.uniform.cameraPos, cam.getPosition());
  gl.uniform3fv(defaultShader.uniform.cameraDir, cam.getDirection());
  gl.uniform1i(defaultShader.uniform.flashlightOn, flashlightOn ? 1 : 0);
  gl.uniform1f(defaultShader.uniform.flashlightInnerAngle, flashlightInnerAngle);
  gl.uniform1f(defaultShader.uniform.flashlightOuterAngle, flashlightOuterAngle);

  // Transformation Matrices
  gl.uniformMatrix4fv(defaultShader.uniform.mView, false, cam.getViewMatrix());
  gl.uniformMatrix4fv(defaultShader.uniform.mProjection, false, cam.getProjectionMatrix());

  // Directional Light
  gl.uniform3fv(defaultShader.uniform.ambient, lights.ambient);
  gl.uniform3fv(defaultShader.uniform.sunInt, lights.directional.intensity);
  gl.uniform3fv(defaultShader.uniform.sunPos, lights.directional.position);

  // Point Light
  gl.uniform1i(defaultShader.uniform.lightCount, lights.point.length);
  for (let i = 0; i < lights.point.length; i++) {
    gl.uniform3fv(defaultShader.uniform.lights[i].pos, lights.point[i].position);
    gl.uniform3fv(defaultShader.uniform.lights[i].color, lights.point[i].color);
    gl.uniform3fv(defaultShader.uniform.lights[i].atten, lights.point[i].attenuation);
  }

  // Fog
  gl.uniform1f(defaultShader.uniform.fogDensity, fog.density);
  gl.uniform3fv(defaultShader.uniform.fogColor, fog.color);

  for (const object of map) {

    // Mesh
    gl.bindVertexArray(object.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, object.vertPos);
    gl.bindBuffer(gl.ARRAY_BUFFER, object.vertNormals);

    // Texture
    gl.bindBuffer(gl.ARRAY_BUFFER, object.texCoords);
    gl.bindTexture(gl.TEXTURE_2D, object.texture);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.indicies);

    // Specular Lighting
    gl.uniform1f(defaultShader.uniform.shininess, object.shininess);
    gl.uniform1f(defaultShader.uniform.specCoef, object.specCoef);

    // Draw
    for (const instance of object.instances) {
      gl.uniformMatrix4fv(defaultShader.uniform.mWorld, false, instance);
      gl.drawElements(gl.TRIANGLES, object.indexCount, gl.UNSIGNED_SHORT, 0);
    }
  }

  // SKYBOX
  gl.useProgram(skyboxShader.program);
  skybox.draw(cam);

  // DEBUG VIEW
  if (collisions.draw) {
    gl.useProgram(colliderShader.program);
    collisions.boxes.forEach(box => box.draw(cam));
    lights.point.forEach(light => light.draw(cam));
  }

  // GUI
  gl.useProgram(guiShader.program);
  guiRenderer.draw();
}

// KEYBOARD LISTENER
document.addEventListener('keydown', e => {
  switch (e.keyCode) {
    case 67:
      collisions.draw = !collisions.draw;
      break;
    case 70:
      flashlightOn = !flashlightOn;
      break;
  }
});
