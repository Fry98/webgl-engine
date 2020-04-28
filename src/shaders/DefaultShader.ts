import vert from './glsl/default.vert.glsl';
import frag from './glsl/default.frag.glsl';
import Shader from './Shader';

export default class DefaultShader extends Shader {
  program: WebGLProgram;
  attrib: {
    vertPosition: number,
    vertNormal: number,
    texCoords: number
  };
  uniform: {
    mWorld: WebGLUniformLocation,
    mViewProjection: WebGLUniformLocation,
    ambient: WebGLUniformLocation,
    sunInt: WebGLUniformLocation,
    sunPos: WebGLUniformLocation,
    shininess: WebGLUniformLocation,
    specCoef: WebGLUniformLocation,
    cameraPos: WebGLUniformLocation
  }

  constructor(gl: WebGL2RenderingContext) {
    super(gl, vert, frag);
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
      mViewProjection: gl.getUniformLocation(this.program, 'mViewProjection'),
      ambient: gl.getUniformLocation(this.program, 'ambient'),
      sunInt: gl.getUniformLocation(this.program, 'sunInt'),
      sunPos: gl.getUniformLocation(this.program, 'sunPos'),
      shininess: gl.getUniformLocation(this.program, 'shininess'),
      specCoef: gl.getUniformLocation(this.program, 'specCoef'),
      cameraPos: gl.getUniformLocation(this.program, 'cameraPos')
    };
  }
}
