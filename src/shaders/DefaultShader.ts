import vert from './glsl/default.vert.glsl';
import frag from './glsl/default.frag.glsl';
import Shader from './Shader';

export default class DefaultShader extends Shader {
  attrib: {
    vertPosition: number,
    vertNormal: number,
    texCoords: number
  };
  uniform: {
    mWorld: WebGLUniformLocation,
    mView: WebGLUniformLocation,
    mProjection: WebGLUniformLocation,
    ambient: WebGLUniformLocation,
    sunInt: WebGLUniformLocation,
    sunPos: WebGLUniformLocation,
    shininess: WebGLUniformLocation,
    specCoef: WebGLUniformLocation,
    cameraPos: WebGLUniformLocation,
    fogDensity: WebGLUniformLocation,
    fogColor: WebGLUniformLocation
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
      mView: gl.getUniformLocation(this.program, 'mView'),
      mProjection: gl.getUniformLocation(this.program, 'mProjection'),
      ambient: gl.getUniformLocation(this.program, 'ambient'),
      sunInt: gl.getUniformLocation(this.program, 'sunInt'),
      sunPos: gl.getUniformLocation(this.program, 'sunPos'),
      shininess: gl.getUniformLocation(this.program, 'shininess'),
      specCoef: gl.getUniformLocation(this.program, 'specCoef'),
      cameraPos: gl.getUniformLocation(this.program, 'cameraPos'),
      fogDensity: gl.getUniformLocation(this.program, 'fogDensity'),
      fogColor: gl.getUniformLocation(this.program, 'fogColor')
    };
  }
}
