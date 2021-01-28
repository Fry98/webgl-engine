import vert from './glsl/picking.vert.glsl';
import frag from './glsl/picking.frag.glsl';
import Shader from './Shader';

export default class PickingShader extends Shader {
  attrib: {
    vertPosition: number
  };
  uniform: {
    mViewProjection: WebGLUniformLocation,
    mWorld: WebGLUniformLocation,
    color: WebGLUniformLocation
  };

  constructor(gl: WebGL2RenderingContext) {
    super(gl, vert, frag);
    this.setupLocations(gl);
  }

  private setupLocations(gl: WebGL2RenderingContext) {
    this.attrib = {
      vertPosition: gl.getAttribLocation(this.program, 'vertPosition'),
    };
    this.uniform = {
      mViewProjection: gl.getUniformLocation(this.program, 'mViewProjection'),
      mWorld: gl.getUniformLocation(this.program, 'mWorld'),
      color: gl.getUniformLocation(this.program, 'color')
    };
  }
}
