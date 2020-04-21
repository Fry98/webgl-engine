export default function(gl: WebGL2RenderingContext) {
  rescale();
  window.addEventListener('resize', rescale);

  function rescale() {
    if((window.innerWidth / 16) * 9 <= window.innerHeight){
      gl.canvas.width = window.innerWidth;
      gl.canvas.height = (window.innerWidth / 16) * 9;
    }
    else{
      gl.canvas.height = window.innerHeight;
      gl.canvas.width = (window.innerHeight / 9) * 16;
    }
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }
}
