import SkyboxShader from "./shaders/SkyboxShader";
import Camera from "./Camera";
import { mat4 } from "gl-matrix";

export default class Skybox {
  private vao: WebGLVertexArrayObject;
  private vertices: number[];
  private vertBuffer: WebGLBuffer;
  private texture: WebGLTexture;
  private gl: WebGL2RenderingContext;
  private shader: SkyboxShader;

  constructor(gl: WebGL2RenderingContext, shader: SkyboxShader, textures: HTMLImageElement[]) {
    this.gl = gl;
    this.shader = shader;
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    this.vertices = [
      -1.0,  1.0, -1.0,
      -1.0, -1.0, -1.0,
      1.0, -1.0, -1.0,
      1.0, -1.0, -1.0,
      1.0,  1.0, -1.0,
      -1.0,  1.0, -1.0,

      -1.0, -1.0,  1.0,
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
      -1.0, -1.0,  1.0,

      1.0, -1.0, -1.0,
      1.0, -1.0,  1.0,
      1.0,  1.0,  1.0,
      1.0,  1.0,  1.0,
      1.0,  1.0, -1.0,
      1.0, -1.0, -1.0,

      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
      1.0,  1.0,  1.0,
      1.0,  1.0,  1.0,
      1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,

      -1.0,  1.0, -1.0,
      1.0,  1.0, -1.0,
      1.0,  1.0,  1.0,
      1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0,

      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
      1.0, -1.0, -1.0,
      1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
      1.0, -1.0,  1.0
    ];

    this.vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      shader.attrib.vertPosition,
      3,
      gl.FLOAT,
      false,
      3 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(shader.attrib.vertPosition);

    const skyboxTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    for (let i = 0; i < textures.length; i++) {
      gl.texImage2D(
        gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
        0, gl.RGBA, gl.RGBA,
        gl.UNSIGNED_BYTE,
        textures[i]
      );
    }

    this.texture = skyboxTex;
  }

  draw(cam: Camera) {
    const mView = cam.getViewMatrix();
    const mProj = cam.getProjectionMatrix();
    const mViewNoTrans = mat4.fromValues(
      mView[0], mView[1], mView[2], 0,
      mView[4], mView[5], mView[6], 0,
      mView[8], mView[9], mView[10], 0,
      0, 0, 0, 1
    );

    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.bindVertexArray(this.vao);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
    this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.texture);
    this.gl.uniformMatrix4fv(this.shader.uniform.mView, false, mViewNoTrans);
    this.gl.uniformMatrix4fv(this.shader.uniform.mProjection, false, mProj);
    
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.length / 3);
    this.gl.depthFunc(this.gl.LESS);
  }
}
