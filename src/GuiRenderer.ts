import GuiShader from "./shaders/GuiShader";

export default class GuiRenderer {
  private gl: WebGL2RenderingContext;
  private shader: GuiShader;
  private vao: WebGLVertexArrayObject;
  private vertices: number[];
  private vertBuffer: WebGLBuffer;
  private texCoordBuffer: WebGLBuffer;
  private texture: WebGLTexture;
  private textureImage: HTMLImageElement;

  constructor(gl: WebGL2RenderingContext, shader: GuiShader, texture: HTMLImageElement) {
    this.gl = gl;
    this.shader = shader;
    this.textureImage = texture;
    this.vertices = [
      -0.004, 0.004, 0, 0,
      0.004, 0.004, 1, 0,
      -0.004, -0.004, 0, 1,
      0.004, -0.004, 1, 1
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

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0, gl.RGBA, gl.RGBA,
      gl.UNSIGNED_BYTE,
      this.textureImage
    );
  }

  draw() {
    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.bindVertexArray(this.vao);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    this.gl.enable(this.gl.DEPTH_TEST);
  }
}
