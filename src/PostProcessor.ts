import PostprocessShader from "./shaders/PostprocessShader";

export default class Billboard {
  private vao: WebGLVertexArrayObject;
  private vertBuffer: WebGLBuffer;
  private texture: WebGLTexture;
  private gl: WebGL2RenderingContext;

  constructor(gl: WebGL2RenderingContext, shader: PostprocessShader, postproTex: WebGLTexture) {
    this.gl = gl;
    this.texture = postproTex;
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    const vertices = [
      -1.0, -1.0, 0.0, 0.0,
      1.0, -1.0, 1.0, 0.0,
      -1.0, 1.0, 0.0, 1.0,
      1.0, 1.0, 1.0, 1.0
    ];

    this.vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(
      shader.attrib.vertPosition,
      2,
      gl.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(shader.attrib.vertPosition);

    gl.vertexAttribPointer(
      shader.attrib.vertTexCoord,
      2,
      gl.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      2 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(shader.attrib.vertTexCoord);
  }

  draw() {
    this.gl.bindVertexArray(this.vao);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }
}
