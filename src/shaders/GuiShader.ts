import vert from './glsl/gui.vert.glsl';
import frag from './glsl/gui.frag.glsl';
import Shader from './Shader';

export default class GuiShader extends Shader {
  attrib: {
    vertPosition: number,
    vertTexCoord: number
  };
  uniform: {
    mAnim: WebGLUniformLocation
  };

  constructor(gl: WebGL2RenderingContext) {
    super(gl, vert, frag);
    this.setupLocations(gl);
  }

  private setupLocations(gl: WebGL2RenderingContext) {
    this.attrib = {
      vertPosition: gl.getAttribLocation(this.program, 'vertPosition'),
      vertTexCoord: gl.getAttribLocation(this.program, 'vertTexCoord')
    };
    this.uniform = {
      mAnim: gl.getUniformLocation(this.program, 'mAnim')
    };
  }
}

