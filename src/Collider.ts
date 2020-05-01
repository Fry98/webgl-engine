import { vec3 } from "gl-matrix";
import Camera from "./Camera";
import ColliderShader from "./shaders/ColliderShader";

export default class Collider {
  private gl: WebGL2RenderingContext;
  private vao: WebGLVertexArrayObject;
  private vertBuffer: WebGLBuffer;
  private shader: ColliderShader;
  private position: vec3;
  private size: vec3;
  private vertices: number[];

  constructor(gl: WebGL2RenderingContext, position: vec3, size: vec3, shader: ColliderShader) {
    this.gl = gl;
    this.shader = shader;
    this.position = position;
    this.size = size;

    const [x, y, z] = this.position;
    const [w, h, d] = this.size;

    this.vertices = [
      // Front
      x, y, z,
      x + w, y, z,
      x, y + h, z,
      x + w, y, z,
      x, y + h, z,
      x + w, y + h, z,

      // Back
      x, y, z + d,
      x + w, y, z + d,
      x, y + h, z + d,
      x + w, y, z + d,
      x, y + h, z + d,
      x + w, y + h, z + d,

      // Left
      x, y, z,
      x, y, z + d,
      x, y + h, z,
      x, y, z + d,
      x, y + h, z,
      x, y + h, z + d,

      // Right
      x + w, y, z,
      x + w, y, z + d,
      x + w, y + h, z,
      x + w, y, z + d,
      x + w, y + h, z,
      x + w, y + h, z + d,

      // Bottom
      x, y, z,
      x + w, y, z,
      x, y, z + d,
      x + w, y, z,
      x, y, z + d,
      x + w, y, z + d,

      // Top
      x, y + h, z,
      x + w, y + h, z,
      x, y + h, z + d,
      x + w, y + h, z,
      x, y + h, z + d,
      x + w, y + h, z + d
    ];

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    this.vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
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
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.length / 3);
  }

  isColliding(cam: Camera) {
    const [xBox, yBox, zBox] = this.position;
    const [w, h, d] = this.size;
    const [xCam, yCam, zCam] = cam.getPosition();
    return (
      xCam >= xBox &&
      xCam <= xBox + w &&
      yCam >= yBox &&
      yCam <= yBox + h &&
      zCam >= zBox &&
      zCam <= zBox + d
    );
  }
}
