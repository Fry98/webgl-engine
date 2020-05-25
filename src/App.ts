// IMPORTS
import { glMatrix, vec4, vec3 } from 'gl-matrix';
import KeyMap from './Keymap';
import Camera, { View } from './Camera';
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
import PickingShader from './shaders/PickingShader';
import GameObject from './GameObject';

// DOM SETUP
const canv = document.getElementById('canv') as HTMLCanvasElement;
const loading = document.getElementById('loading');
const gl = canv.getContext('webgl2');
const frameBuffer = gl.createFramebuffer();
const fbTexture = gl.createTexture();
canv.onclick = () => canv.requestPointerLock();
viewport(gl, frameBuffer, fbTexture);

// SHADERS
const defaultShader = new DefaultShader(gl);
const skyboxShader = new SkyboxShader(gl);
const colliderShader = new ColliderShader(gl);
const guiShader = new GuiShader(gl);
const pickingShader = new PickingShader(gl);

// DECLARATIONS
const mouse = new MouseTracker(canv);
const flashlightInnerCutoff = Math.cos(glMatrix.toRadian(config.flashlight.inner));
const flashlightOuterCutoff = Math.cos(glMatrix.toRadian(config.flashlight.outer));
let flashlightOn = false;
let isPicking = false;
let pickedIndex: number = 0;
let pickedObject: GameObject = null;
let cam: Camera = null;
let map: Map = null;
let skybox: Skybox = null;
let lights: LightMap = null;
let fog: Fog = null;
let collisions: Collisions = null;
let guiRenderer: GuiRenderer = null;
main();

// MAIN FUNCTION
async function main() {
  try {
    const loaded = await loadMap(
      gl, 'map.json',
      defaultShader,
      skyboxShader,
      colliderShader,
      pickingShader
    );
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

  // SCENE TRANSFORM
  if (pickedIndex !== 0) {
    const fwdDir = vec3.clone(cam.getDirection());
    fwdDir[1] = 0;
    vec3.normalize(fwdDir, fwdDir);
    vec3.scale(fwdDir, fwdDir, 0.4);

    const leftDir = vec3.clone(fwdDir);
    const temp = leftDir[0];
    leftDir[0] = leftDir[2];
    leftDir[2] = -temp;

    if (KeyMap[73]) {
      pickedObject.move(fwdDir);
    }

    if (KeyMap[75]) {
      pickedObject.move(fwdDir.map((x: number) => -x) as vec3);
    }

    if (KeyMap[74]) {
      pickedObject.move(leftDir);
    }

    if (KeyMap[76]) {
      pickedObject.move(leftDir.map((x: number) => -x) as vec3);
    }

    if (KeyMap[85]) {
      if (KeyMap[16]) {
        pickedObject.scaleUp(-0.1);
      } else {
        pickedObject.move([0, -0.3, 0]);
      }
    }

    if (KeyMap[79]) {
      if (KeyMap[16]) {
        pickedObject.scaleUp(0.1);
      } else {
        pickedObject.move([0, 0.3, 0]);
      }
    }
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
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // ENVIROMENT
  gl.useProgram(defaultShader.program);

  // Flashlight
  gl.uniform3fv(defaultShader.uniform.cameraPos, cam.getPosition());
  gl.uniform3fv(defaultShader.uniform.cameraDir, cam.getDirection());
  gl.uniform1i(defaultShader.uniform.flashlightOn, flashlightOn ? 1 : 0);
  gl.uniform3fv(defaultShader.uniform.flashlightColor, config.flashlight.color);
  gl.uniform3fv(defaultShader.uniform.flashAttenParams, config.flashlight.atten);
  gl.uniform1f(defaultShader.uniform.flashlightInnerCutoff, flashlightInnerCutoff);
  gl.uniform1f(defaultShader.uniform.flashlightOuterCutoff, flashlightOuterCutoff);

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

  // RENDERBUFFER DRAW
  let index = 1;
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
      gl.uniformMatrix4fv(defaultShader.uniform.mWorld, false, instance.getWorldMatrix());
      gl.uniform1i(defaultShader.uniform.picked, index === pickedIndex ? 1 : 0);
      gl.drawElements(gl.TRIANGLES, object.indexCount, gl.UNSIGNED_SHORT, 0);
      index++;
    }
  }

  // PICKING FRAMEBUFFER DRAW
  if (isPicking) {
    isPicking = false;
    gl.useProgram(pickingShader.program);
    gl.disable(gl.BLEND);
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(pickingShader.uniform.mViewProjection, false, cam.getViewProjectionMatrix());

    const indexedObjects: {
      [K: number]: GameObject
    } = {};
    index = 1;
    for (const object of map) {
      gl.bindVertexArray(object.pickingVao);
      gl.bindBuffer(gl.ARRAY_BUFFER, object.vertPos);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.indicies);
      for (const instance of object.instances) {
        const color: vec4 = [
          ((index >> 0) & 0xFF) / 0xFF,
          ((index >> 8) & 0xFF) / 0xFF,
          ((index >> 16) & 0xFF) / 0xFF,
          ((index >> 24) & 0xFF) / 0xFF
        ];

        gl.uniform4fv(pickingShader.uniform.color, color);
        gl.uniformMatrix4fv(pickingShader.uniform.mWorld, false, instance.getWorldMatrix());
        gl.drawElements(gl.TRIANGLES, object.indexCount, gl.UNSIGNED_SHORT, 0);
        indexedObjects[index] = instance;
        index++;
      }
    }

    const data = new Uint8Array(4);
    gl.readPixels(
      Math.floor(canv.width / 2),
      Math.floor(canv.height / 2),
      1, 1,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      data
    );
    const clickedIndex = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);
    if (clickedIndex !== pickedIndex) {
      pickedIndex = clickedIndex;
      pickedObject = indexedObjects[pickedIndex];
    }

    gl.enable(gl.BLEND);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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
  if (cam.getState() === View.FREE) {
    gl.useProgram(guiShader.program);
    guiRenderer.draw();
  }
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
    case 69:
      cam.switchView();
      break;
  }
});

document.addEventListener('mousedown', e => {
  if (document.pointerLockElement !== canv) return;
  switch (e.button) {
    case 0:
      isPicking = true;
      break;
    case 2:
      pickedIndex = 0;
      break;
  }
});
