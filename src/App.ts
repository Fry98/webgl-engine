// IMPORTS
import KeyMap from './Keymap';
import Camera from './Camera';
import viewport from './Viewport';
import DefaultShader from './shaders/DefaultShader';
import MouseTracker from './MouseTracker';
import config from './config.json';
import loadMap, { Map, LightMap, Fog, Collisions } from './MapLoader';
import Skybox from './Skybox';
import SkyboxShader from './shaders/SkyboxShader';
import ColliderShader from './shaders/ColliderShader';

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

// DECLARATIONS
const cam = new Camera([0, 0, 0], [0, 0, 1], config.fov);
const mouse = new MouseTracker(canv);
let map: Map = null;
let skybox: Skybox = null;
let lights: LightMap = null;
let fog: Fog = null;
let collisions: Collisions = null;
main();

// MAIN FUNCTION
async function main() {
  loadMap(gl, defaultShader, skyboxShader, colliderShader, 'map.json').then(loaded => {
    map = loaded.objects;
    skybox = loaded.skybox;
    lights = loaded.lights;
    fog = loaded.fog;
    collisions = {
      draw: false,
      boxes: loaded.boxes
    };

    loading.style.display = 'none';
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    requestAnimationFrame(loop);
  }).catch(e => {
    loading.innerHTML = 'ERROR';
    setTimeout(() => {
      alert(e.message);
    }, 0);
  });
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
  gl.uniform3fv(defaultShader.uniform.cameraPos, cam.getPosition());

  // Transformation Matrices
  gl.uniformMatrix4fv(defaultShader.uniform.mView, false, cam.getViewMatrix());
  gl.uniformMatrix4fv(defaultShader.uniform.mProjection, false, cam.getProjectionMatrix());

  // Directional Light
  gl.uniform3fv(defaultShader.uniform.ambient, lights.ambient);
  gl.uniform3fv(defaultShader.uniform.sunInt, lights.directional.intensity);
  gl.uniform3fv(defaultShader.uniform.sunPos, lights.directional.position);

  // Point Light
  console.log(lights.point.length);
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

  // COLLIDERS
  if (collisions.draw) {
    gl.useProgram(colliderShader.program);
    collisions.boxes.forEach(box => box.draw(cam));
  }
}

// KEYBOARD LISTENER
document.addEventListener('keydown', e => {
  if (e.keyCode === 67) {
    collisions.draw = !collisions.draw;
  }
});
