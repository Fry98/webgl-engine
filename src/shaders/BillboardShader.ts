import vert from './glsl/billboard.vert.glsl';
import frag from './glsl/billboard.frag.glsl';
import Shader from './Shader';

export default class BillboardShader extends Shader {
  attrib: {
    vertPosition: number,
    vertTexCoord: number
  };
  uniform: {
    mViewProjection: WebGLUniformLocation
  };

  constructor(gl: WebGL2RenderingContext) {
    super(gl, vert, frag);
    this.setupLocations(gl);
  }

  private setupLocations(gl: WebGL2RenderingContext) {
    this.attrib = {
      vertPosition: gl.getAttribLocation(this.program, 'vertPosition'),
      vertTexCoord: gl.getAttribLocation(this.program, 'vertTexCoord'),
    };
    this.uniform = {
      mViewProjection: gl.getUniformLocation(this.program, 'mViewProjection')
    };
  }
}
