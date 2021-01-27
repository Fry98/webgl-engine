import Camera from "./Camera";
import BillboardShader from "./shaders/BillboardShader";
import { mat4, vec3 } from "gl-matrix";

export default class Billboard {
  private vao: WebGLVertexArrayObject;
  private vertBuffer: WebGLBuffer;
  private texCoordBuffer: WebGLBuffer;
  private texture: WebGLTexture;
  private gl: WebGL2RenderingContext;
  private shader: BillboardShader;
  private position: vec3 = [-1, -1.5, -9.5];

  constructor(gl: WebGL2RenderingContext, shader: BillboardShader, image: HTMLImageElement) {
    this.gl = gl;
    this.shader = shader;
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    const size = 7;
    const vertices = [
      0 - size / 2, 0 + size / 2, 0,
      0 + size / 2, 0 + size / 2, 0,
      0 - size / 2, 0 - size / 2, 0,
      0 + size / 2, 0 - size / 2, 0,
    ];

    this.vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      shader.attrib.vertPosition,
      3,
      gl.FLOAT,
      false,
      3 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(shader.attrib.vertPosition);

    this.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.vertexAttribPointer(
      shader.attrib.vertTexCoord,
      2,
      gl.FLOAT,
      false,
      2 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(shader.attrib.vertTexCoord);

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0, gl.RGBA, gl.RGBA,
      gl.UNSIGNED_BYTE,
      image
    );
  }

  draw(cam: Camera) {

    // No Rotation Matrix
    const mWorld = mat4.create();
    mat4.translate(mWorld, mWorld, this.position);
    const camPos = cam.getViewMatrix();
    mat4.multiply(camPos, camPos, mWorld);

    const mNoRotation = mat4.fromValues(
      1, 0, 0, camPos[3],
      0, 1, 0, camPos[7],
      0, 0, 1, camPos[11],
      camPos[12], camPos[13], camPos[14], camPos[15]
    );
    mat4.multiply(mNoRotation, cam.getProjectionMatrix(), mNoRotation);

    // Animation frame
    const frame = Math.round((performance.now() / 1000) * 17 * 1.8) % 18;
    const texTileX = frame % 4;
    const texTileY = Math.floor(frame / 4);
    const uvTileWidth = 1 / 4;
    const uvTileHeight = 1 / 5;
    const uvCoords = [
      texTileX * uvTileWidth, 1 - texTileY * uvTileHeight,
      texTileX * uvTileWidth + uvTileWidth, 1 - texTileY * uvTileHeight,
      texTileX * uvTileWidth, 1 - (texTileY * uvTileHeight + uvTileHeight),
      texTileX * uvTileWidth + uvTileWidth, 1 - (texTileY * uvTileHeight + uvTileHeight),
    ];

    // Draw
    this.gl.bindVertexArray(this.vao);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(uvCoords), this.gl.STATIC_DRAW);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.uniformMatrix4fv(this.shader.uniform.mViewProjection, false, mNoRotation);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }
}
