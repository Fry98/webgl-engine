export default abstract class Shader {
  program: WebGLProgram;
  attrib: {
    [K: string]: number
  };
  uniform: {
    [K: string]: WebGLUniformLocation
  };

  constructor(gl: WebGL2RenderingContext, vert: string, frag: string) {
    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vert);
    gl.shaderSource(fragmentShader, frag);
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    this.program = program;
  }
}
