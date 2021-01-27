type FramebufferPair = [
  WebGLFramebuffer,
  WebGLTexture,
  WebGLRenderbuffer?
];

export default function(gl: WebGL2RenderingContext, pairs: FramebufferPair[]) {
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
    for (const [framebuffer, texture, depthBuffer] of pairs) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0, gl.RGBA,
        gl.canvas.width,
        gl.canvas.height,
        0, gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

      if (depthBuffer) {
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, gl.canvas.width, gl.canvas.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
      }
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
}
