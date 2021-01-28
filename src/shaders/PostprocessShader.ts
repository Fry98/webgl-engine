import vert from './glsl/postprocess.vert.glsl';
import frag from './glsl/postprocess.frag.glsl';
import Shader from './Shader';

export default class BillboardShader extends Shader {
  attrib: {
    vertPosition: number,
    vertTexCoord: number
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
      noise: gl.getUniformLocation(this.program, 'noise'),
      noiseChannel: gl.getUniformLocation(this.program, 'noiseChannel')
    };
  }
}
