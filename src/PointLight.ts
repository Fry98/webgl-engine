import { vec3, mat4 } from "gl-matrix";
import Camera from "./Camera";
import ColliderShader from "./shaders/ColliderShader";
import { cubeVertices } from "./CubeVertices";

export class PointLight {
  position: vec3;
  color: vec3;
  attenuation: vec3;
  private gl: WebGL2RenderingContext;
  private vao: WebGLVertexArrayObject;
  private shader: ColliderShader;
  private vertBuffer: WebGLBuffer;
  private mWorld: mat4;

  constructor(gl: WebGL2RenderingContext, shader: ColliderShader, position: vec3, color: vec3, attenuation: vec3) {
    this.gl = gl;
    this.position = position;
    this.color = color;
    this.attenuation = attenuation;
    this.shader = shader;
    this.vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.vao);

    this.mWorld = mat4.create();
    mat4.translate(this.mWorld, this.mWorld, position);
    mat4.scale(this.mWorld, this.mWorld, [0.3, 0.3, 0.3]);

    this.vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      shader.attrib.vertPosition,
      3,
      gl.FLOAT,
      false,
      3 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(shader.attrib.vertPosition);
  }

  draw(cam: Camera) {
    this.gl.bindVertexArray(this.vao);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
    this.gl.uniformMatrix4fv(this.shader.uniform.mViewProjection, false, cam.getViewProjectionMatrix());
    this.gl.uniformMatrix4fv(this.shader.uniform.mWorld, false, this.mWorld);
    this.gl.uniform4fv(this.shader.uniform.color, [0, 0, 1, 1]);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, cubeVertices.length / 3);
  }
}
