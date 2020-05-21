export default function(gl: WebGL2RenderingContext, frameBuffer: WebGLFramebuffer, texture: WebGLTexture) {
  rescale();
  window.addEventListener('resize', rescale);

  function rescale() {

    // Canvas
    if ((window.innerWidth / 16) * 9 <= window.innerHeight) {
      gl.canvas.width = window.innerWidth;
      gl.canvas.height = (window.innerWidth / 16) * 9;
    } else {
      gl.canvas.height = window.innerHeight;
      gl.canvas.width = (window.innerHeight / 9) * 16;
    }
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0, gl.RGBA,
      window.innerWidth,
      window.innerHeight,
      0, gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
}
