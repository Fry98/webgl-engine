import { glMatrix } from 'gl-matrix';
import { mat4 } from 'gl-matrix';
import { downloadMeshes, MeshMap, Mesh } from '../node_modules/webgl-obj-loader/src/index';
import DefaultShader from './DefaultShader';

export type Map = {
  vao: WebGLVertexArrayObject,
  vertPos: WebGLBuffer,
  texture: WebGLTexture,
  texCoords: WebGLBuffer,
  vertNormals: WebGLBuffer,
  indicies: WebGLBuffer,
  indexCount: number,
  instances: mat4[]
}[];

export default async function loadMap(gl: WebGL2RenderingContext, shader: DefaultShader, path: string) {
  const res = await fetch(`maps/${path}`);
  const map = await res.json();

  const imageProms: Promise<HTMLImageElement>[] = [];
  const mesheProms: Promise<Mesh>[] = [];
  for (const object of map.objects) {
    imageProms.push(loadImage(object.diffuse));
    mesheProms.push(loadMesh(object.mesh));
  }

  const [images, meshes] = await Promise.all([Promise.all(imageProms), Promise.all(mesheProms)]);
  const objects: Map = [];
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
      shader.attrib.vertPosition,
      3,
      gl.FLOAT,
      false,
      3 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(shader.attrib.vertPosition);

    const texCoords = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoords);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshes[i].textures), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      shader.attrib.texCoords,
      2,
      gl.FLOAT,
      false,
      2 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(shader.attrib.texCoords);

    const vertNormals = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertNormals);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshes[i].vertexNormals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      shader.attrib.vertNormal,
      3,
      gl.FLOAT,
      false,
      3 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(shader.attrib.vertNormal);

    const indicies = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicies);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(meshes[i].indices), gl.STATIC_DRAW);

    const instances: mat4[] = [];
    const placements = map.objects[i].placement;
    for (const placement of placements) {
      const mWorld = mat4.create();
      mat4.translate(mWorld, mWorld, placement.position);
      mat4.rotateX(mWorld, mWorld, glMatrix.toRadian(placement.rotation[0]));
      mat4.rotateY(mWorld, mWorld, glMatrix.toRadian(placement.rotation[1]));
      mat4.rotateZ(mWorld, mWorld, glMatrix.toRadian(placement.rotation[2]));
      mat4.scale(mWorld, mWorld, placement.scale);
      instances.push(mWorld);
    }

    objects.push({
      vao,
      vertPos,
      texture,
      texCoords,
      vertNormals,
      indicies,
      indexCount: meshes[i].indices.length,
      instances
    });
  }

  return objects;
}

function loadImage(path: string): Promise<HTMLImageElement> {
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
