import vert from './shaders/default.vert.glsl';
import frag from './shaders/default.frag.glsl';

export default class DefaultShader {
  program: WebGLProgram;
  attrib: {
    vertPosition: number,
    vertNormal: number,
    texCoords: number
  };
  uniform: {
    mWorld: WebGLUniformLocation,
    mViewProjection: WebGLUniformLocation
  }

  constructor(gl: WebGL2RenderingContext) {
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
    this.setupLocations(gl);
  }

  private setupLocations(gl: WebGL2RenderingContext) {
    this.attrib = {
      vertPosition: gl.getAttribLocation(this.program, 'vertPosition'),
      vertNormal: gl.getAttribLocation(this.program, 'vertNormal'),
      texCoords: gl.getAttribLocation(this.program, 'vertTexCoord')
    };
    this.uniform = {
      mWorld: gl.getUniformLocation(this.program, 'mWorld'),
      mViewProjection: gl.getUniformLocation(this.program, 'mViewProjection')
    };
  }
}
