import vert from './glsl/skybox.vert.glsl';
import frag from './glsl/skybox.frag.glsl';
import Shader from './Shader';

export default class SkyboxShader extends Shader {
  attrib: {
    vertPosition: number,
  };
  uniform: {
    mView: WebGLUniformLocation,
    mProjection: WebGLUniformLocation
  }

  constructor(gl: WebGL2RenderingContext) {
    super(gl, vert, frag);
    this.setupLocations(gl);
  }

  private setupLocations(gl: WebGL2RenderingContext) {
    this.attrib = {
      vertPosition: gl.getAttribLocation(this.program, 'vertPosition'),
    };
    this.uniform = {
      mView: gl.getUniformLocation(this.program, 'mView'),
      mProjection: gl.getUniformLocation(this.program, 'mProjection')
    };
  }
}
