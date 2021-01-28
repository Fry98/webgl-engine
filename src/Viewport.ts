import { floor } from "gl-matrix/src/gl-matrix/vec2";

export interface BufferObject {
  colorFrameBuffer: WebGLFramebuffer;
  colorBuffer: WebGLTexture;
  zBuffer: WebGLRenderbuffer;
  renderFrameBuffer?: WebGLFramebuffer;
  renderBuffer?: WebGLRenderbuffer;
};

export default function(gl: WebGL2RenderingContext, bos: BufferObject[]) {
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
    for (const {
      colorFrameBuffer, colorBuffer,
      renderFrameBuffer, renderBuffer,
      zBuffer
    } of bos) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, colorFrameBuffer);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      gl.bindTexture(gl.TEXTURE_2D, colorBuffer);
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
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorBuffer, 0);

      if (renderFrameBuffer && renderBuffer) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, renderFrameBuffer);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
        gl.renderbufferStorageMultisample(gl.RENDERBUFFER, 8, gl.RGBA8, gl.canvas.width, gl.canvas.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, renderBuffer);

        gl.bindRenderbuffer(gl.RENDERBUFFER, zBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, gl.canvas.width, gl.canvas.height);
        gl.renderbufferStorageMultisample(gl.RENDERBUFFER, 8, gl.DEPTH_COMPONENT24, gl.canvas.width, gl.canvas.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, zBuffer);
      } else {
        gl.bindRenderbuffer(gl.RENDERBUFFER, zBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, gl.canvas.width, gl.canvas.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, zBuffer);
      }
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
}
