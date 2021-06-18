import { vec3 } from 'gl-matrix';
import { downloadMeshes, Mesh } from '../node_modules/webgl-obj-loader/src/index';
import DefaultShader from './shaders/DefaultShader';
import Skybox from './Skybox';
import SkyboxShader from './shaders/SkyboxShader';
import Collider from './Collider';
import ColliderShader from './shaders/ColliderShader';
import { PointLight } from './PointLight';
import Camera from './Camera';
import config from './config.json';
import GameObject from './GameObject';
import hardcodedMesh from './HardcodedMesh';

export interface Animation {
  radius: number,
  duration: number
}

export type Map = {
  vao: WebGLVertexArrayObject,
  vertPos: WebGLBuffer,
  texture: WebGLTexture,
  texCoords: WebGLBuffer,
  vertNormals: WebGLBuffer,
  indicies: WebGLBuffer,
  indexCount: number,
  instances: GameObject[],
  shininess: number,
  specCoef: number,
  animation: Animation | null
}[];

export interface LightMap {
  ambient: vec3,
  directional: {
    intensity: vec3,
    position: vec3
  },
  point: PointLight[]
}

export interface Fog {
  color: vec3,
  density: number
}

export interface Collisions {
  draw: boolean,
  boxes: Collider[]
}

export default async function loadMap(
  gl: WebGL2RenderingContext,
  path: string,
  defaultShader: DefaultShader,
  skyboxShader: SkyboxShader,
  colliderShader: ColliderShader
) {
  const res = await fetch(`maps/${path}`);
  const map = await res.json();

  const imageProms: Promise<HTMLImageElement>[] = [];
  const skyboxProms: Promise<HTMLImageElement>[] = [];
  const meshProms: Promise<Mesh>[] = [];

  for (const object of map.objects) {
    imageProms.push(loadImage(object.diffuse));
    meshProms.push(loadMesh(object.mesh));
  }

  for (const tex of map.skybox) {
    skyboxProms.push(loadImage(tex));
  }

  // Hardcoded Mesh Injection
  imageProms.push(loadImage("chair2.png"));
  meshProms.push(Promise.resolve(hardcodedMesh) as Promise<Mesh>);
  map.objects.push({
    shininess: 1,
    specCoef: 0,
    placement: [
      {
        position: [6.7, -4.2, -12],
        rotation: [0, 95, 0],
        scale: [1.6, 1.6, 1.6]
      }
    ]
  });

  const objects: Map = [];
  const [images, meshes, skybox] = await Promise.all([
    Promise.all(imageProms),
    Promise.all(meshProms),
    Promise.all(skyboxProms)
  ]);

  for (let i = 0; i < images.length; i++) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0, gl.RGBA, gl.RGBA,
      gl.UNSIGNED_BYTE,
      images[i]
    );

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vertPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertPos);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshes[i].vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      defaultShader.attrib.vertPosition,
      3,
      gl.FLOAT,
      false,
      3 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(defaultShader.attrib.vertPosition);

    const texCoords = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoords);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshes[i].textures), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      defaultShader.attrib.texCoords,
      2,
      gl.FLOAT,
      false,
      2 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(defaultShader.attrib.texCoords);

    const vertNormals = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertNormals);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshes[i].vertexNormals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      defaultShader.attrib.vertNormal,
      3,
      gl.FLOAT,
      false,
      3 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(defaultShader.attrib.vertNormal);

    const indexMerge = meshes[i].indicesPerMaterial.flat();
    const indicies = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicies);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexMerge), gl.STATIC_DRAW);

    const instances: GameObject[] = [];
    const placements = map.objects[i].placement;
    placements.forEach((inst: any) => instances.push(new GameObject(inst.position, inst.rotation, inst.scale)));

    objects.push({
      vao,
      vertPos,
      texture,
      texCoords,
      vertNormals,
      indicies,
      indexCount: meshes[i].indicesPerMaterial.reduce((acc, x) => acc += x.length, 0),
      instances,
      shininess: map.objects[i].shininess,
      specCoef: map.objects[i].specCoef,
      animation: map.objects[i].animation !== undefined ? map.objects[i].animation : null
    });
  }

  const boxes: Collider[] = [];
  map.colliders.forEach((box: any) => boxes.push(new Collider(gl, box.position, box.size, colliderShader)));

  if (map.lights.point.length > 5) throw new Error('Too many lights');
  const lights: LightMap = {
    ambient: map.lights.ambient,
    directional: map.lights.directional,
    point: map.lights.point.map((x: any) => new PointLight(gl, colliderShader, x.position, x.color, x.attenuation))
  };

  return {
    skybox: new Skybox(gl, skyboxShader, skybox),
    camera: new Camera(map.camera.position, map.camera.direction, config.fov),
    objects,
    lights,
    boxes,
    fog: map.fog as Fog
  };
}

export function loadImage(path: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = `assets/${path}`;
    img.onload = () => resolve(img);
  });
}

function loadMesh(path: string): Promise<Mesh> {
  return new Promise((resolve, reject) => {
    downloadMeshes({
      mesh: `assets/${path}`
    }, meshes => {
      resolve(meshes.mesh);
    }, {});
  });
}
