import GuiShader from "./shaders/GuiShader";
import { mat4, glMatrix, mat2 } from "gl-matrix";

export default class GuiRenderer {
  private gl: WebGL2RenderingContext;
  private shader: GuiShader;
  private vao: WebGLVertexArrayObject;
  private vertices: number[];
  private vertBuffer: WebGLBuffer;
  private texCoordBuffer: WebGLBuffer;
  private textureActive: WebGLTexture;
  private textureIdle: WebGLTexture;

  constructor(gl: WebGL2RenderingContext, shader: GuiShader, imageActive: HTMLImageElement, imageIdle: HTMLImageElement) {
    const SIZE_H = 0.009;
    const SIZE_V = (SIZE_H / gl.canvas.height) * gl.canvas.width;

    this.gl = gl;
    this.shader = shader;
    this.vertices = [
      -SIZE_H, SIZE_V, 0, 0,
      SIZE_H, SIZE_V, 1, 0,
      -SIZE_H, -SIZE_V, 0, 1,
      SIZE_H, -SIZE_V, 1, 1
    ];

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    this.vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      shader.attrib.vertPosition,
      2,
      gl.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(shader.attrib.vertPosition);

    this.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      shader.attrib.vertTexCoord,
      2,
      gl.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      2 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(shader.attrib.vertTexCoord);

    this.textureActive = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.textureActive);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0, gl.RGBA, gl.RGBA,
      gl.UNSIGNED_BYTE,
      imageActive
    );

    this.textureIdle = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.textureIdle);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0, gl.RGBA, gl.RGBA,
      gl.UNSIGNED_BYTE,
      imageIdle
    );
  }

  draw(cursorIdle = false) {
    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.bindVertexArray(this.vao);
    this.gl.bindTexture(this.gl.TEXTURE_2D, cursorIdle ? this.textureIdle : this.textureActive);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);

    const state = performance.now() / 1000 / 2;
    const angle = Math.PI * 2 * state;
    this.gl.uniform1f(this.shader.uniform.rotAngle, angle);

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    this.gl.enable(this.gl.DEPTH_TEST);
  }
}
