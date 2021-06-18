import vert from './glsl/default.vert.glsl';
import frag from './glsl/default.frag.glsl';
import Shader from './Shader';

export interface PointLight {
  pos: WebGLUniformLocation,
  color: WebGLUniformLocation,
  atten: WebGLUniformLocation
}

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
    cameraDir: WebGLUniformLocation,
    fogDensity: WebGLUniformLocation,
    fogColor: WebGLUniformLocation,
    lightCount: WebGLUniformLocation,
    flashlightOn: WebGLUniformLocation,
    flashlightColor: WebGLUniformLocation,
    flashAttenParams: WebGLUniformLocation,
    flashlightInnerCutoff: WebGLUniformLocation,
    flashlightOuterCutoff: WebGLUniformLocation,
    lights: PointLight[]
  };

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
      cameraDir: gl.getUniformLocation(this.program, 'cameraDir'),
      fogDensity: gl.getUniformLocation(this.program, 'fogDensity'),
      fogColor: gl.getUniformLocation(this.program, 'fogColor'),
      lightCount: gl.getUniformLocation(this.program, 'lightCount'),
      flashlightOn: gl.getUniformLocation(this.program, 'flashlightOn'),
      flashlightColor: gl.getUniformLocation(this.program, 'flashlightColor'),
      flashAttenParams: gl.getUniformLocation(this.program, 'flashAttenParams'),
      flashlightInnerCutoff: gl.getUniformLocation(this.program, 'flashlightInnerCutoff'),
      flashlightOuterCutoff: gl.getUniformLocation(this.program, 'flashlightOuterCutoff'),
      lights: this.getLightArray(gl, 5)
    };
  }

  private getLightArray(gl: WebGL2RenderingContext, count: number) {
    const ret: PointLight[] = [];

    for (let i = 0; i < count; i++) {
      ret.push({
        pos: gl.getUniformLocation(this.program, `lights[${i}].pos`),
        color: gl.getUniformLocation(this.program, `lights[${i}].color`),
        atten: gl.getUniformLocation(this.program, `lights[${i}].atten`)
      });
    }

    return ret;
  }
}

