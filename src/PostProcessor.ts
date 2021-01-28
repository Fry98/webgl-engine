import PostprocessShader from "./shaders/PostprocessShader";

export default class Billboard {
  private vao: WebGLVertexArrayObject;
  private vertBuffer: WebGLBuffer;
  private noiseTex: WebGLTexture;
  private texture: WebGLTexture;
  private renderFrameBuffer: WebGLFramebuffer;
  private colorFrameBuffer: WebGLFramebuffer;
  private gl: WebGL2RenderingContext;
  private shader: PostprocessShader;
  private noiseChannel = 0;

  constructor(
    gl: WebGL2RenderingContext,
    shader: PostprocessShader,
    postproTex: WebGLTexture,
    renderFrameBuffer: WebGLFramebuffer,
    colorFrameBuffer: WebGLFramebuffer,
    blueNoise: HTMLImageElement
  ) {
    this.gl = gl;
    this.texture = postproTex;
    this.shader = shader;
    this.renderFrameBuffer = renderFrameBuffer;
    this.colorFrameBuffer = colorFrameBuffer;
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

    this.noiseTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.noiseTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0, gl.RGBA, gl.RGBA,
      gl.UNSIGNED_BYTE,
      blueNoise
    );
  }

  draw(mode: number) {
    // Update noise channel
    if (++this.noiseChannel > 3) this.noiseChannel = 0;

    // Blit renderBuffer to colorBuffer
    this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, this.renderFrameBuffer);
    this.gl.bindFramebuffer(this.gl.DRAW_FRAMEBUFFER, this.colorFrameBuffer);
    this.gl.blitFramebuffer(
      0, 0, this.gl.canvas.width, this.gl.canvas.height,
      0, 0, this.gl.canvas.width, this.gl.canvas.height,
      this.gl.COLOR_BUFFER_BIT, this.gl.NEAREST
    );
    this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, null);
    this.gl.bindFramebuffer(this.gl.DRAW_FRAMEBUFFER, null);


    // Setup and draw
    this.gl.uniform1i(this.shader.uniform.noise, 1);
    this.gl.uniform1i(this.shader.uniform.noiseChannel, this.noiseChannel);
    this.gl.uniform1i(this.shader.uniform.mode, mode);

    this.gl.bindVertexArray(this.vao);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);

    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.noiseTex);

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }
}
