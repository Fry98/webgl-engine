// IMPORTS
import { glMatrix, mat4 } from 'gl-matrix';
import KeyMap from './Keymap';
import Camera, { View } from './Camera';
import DefaultShader from './shaders/DefaultShader';
import MouseTracker from './MouseTracker';
import loadMap, { Map, LightMap, Fog, Collisions, loadImage } from './MapLoader';
import Skybox from './Skybox';
import SkyboxShader from './shaders/SkyboxShader';
import ColliderShader from './shaders/ColliderShader';
import Billboard from './Billboard';
import BillboardShader from './shaders/BillboardShader';

// @ts-ignore
new WebXRPolyfill();

// DOM SETUP
const xr = (navigator as any).xr;
const canv = document.createElement('canvas');
const loading = document.getElementById('loading');
const enterVr = document.getElementById('enter');
const gl = canv.getContext('webgl2');

// SHADERS
const defaultShader = new DefaultShader(gl);
const skyboxShader = new SkyboxShader(gl);
const colliderShader = new ColliderShader(gl);
const billboardShader = new BillboardShader(gl);

// DECLARATIONS
const mouse = new MouseTracker(canv);
let map: Map = null;
let skybox: Skybox = null;
let lights: LightMap = null;
let fog: Fog = null;
let collisions: Collisions = null;
let billboard: Billboard = null;
let xrSession: any = null;
let xrReferenceSpace: any = null;
main();

// MAIN FUNCTION
async function main() {
  try {
    await init();

    const isSupported = await xr.isSessionSupported('immersive-vr');
    if (!isSupported) throw new Error();

    billboard = new Billboard(gl, billboardShader, await loadImage("fire.png"));
    loading.style.display = 'none';
    enterVr.style.display = 'inline-block';

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    enterVr.onclick = initVr;
  } catch (e) {
    loading.innerHTML = 'ERROR';
    setTimeout(() => {
      alert(e.message);
    }, 0);
  }
}

async function initVr() {
  xrSession = await xr.requestSession('immersive-vr');
  xrReferenceSpace = await xrSession.requestReferenceSpace('local');
  await (gl as any).makeXRCompatible();
  xrSession.updateRenderState({ baseLayer: new XRWebGLLayer(xrSession, gl) });
  enterVr.style.display = 'none';
  xrSession.requestAnimationFrame(loop);
}

async function init() {
  const loaded = await loadMap(
    gl, 'map.json',
    defaultShader,
    skyboxShader,
    colliderShader
  );
  map = loaded.objects;
  skybox = loaded.skybox;
  lights = loaded.lights;
  fog = loaded.fog;
  collisions = {
    draw: false,
    boxes: loaded.boxes
  };
}

// GAME LOOP
async function loop(ts: any, xrFrame: any) {
  draw(ts, xrFrame);
  xrSession.requestAnimationFrame(loop);
}

// DRAW FUNCTION
function draw(ts: any, xrFrame: any) {
  let glLayer = xrSession.renderState.baseLayer;
  let pose = xrFrame.getViewerPose(xrReferenceSpace);
  gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for (let view of pose.views) {
    let viewport = glLayer.getViewport(view);
    gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

    gl.useProgram(defaultShader.program);

    // Transformation Matrices
    gl.uniformMatrix4fv(defaultShader.uniform.mView, false, view.transform.inverse.matrix);
    gl.uniformMatrix4fv(defaultShader.uniform.mProjection, false, view.projectionMatrix);

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
        let mWorld: mat4;
        if (object.animation === null) {
          mWorld = instance.getWorldMatrix();
        } else {
          mWorld = instance.getWorldMatrix(object.animation.radius, object.animation.duration);
        }

        gl.uniformMatrix4fv(defaultShader.uniform.mWorld, false, mWorld);
        gl.drawElements(gl.TRIANGLES, object.indexCount, gl.UNSIGNED_SHORT, 0);
      }
    }

    // SKYBOX
    gl.useProgram(skyboxShader.program);
    skybox.draw(view);

    // FIRE BILLBOARD
    gl.useProgram(billboardShader.program);
    billboard.draw(view);
  }
}
