import { vec3, mat4, glMatrix } from "gl-matrix";

export default class Camera {
  private position: vec3;
  private direction = vec3.create();
  private projection = mat4.create();

  constructor(position: vec3, direction: vec3, fov: number) {
    this.position = position;
    vec3.normalize(this.direction, direction);
    mat4.perspective(
      this.projection,
      glMatrix.toRadian(fov),
      16 / 9,
      0.1,
      1000
    );
  }

  getPosition() {
    return this.position;
  }

  getViewMatrix() {
    const out = mat4.create();
    const lookAt = vec3.create();
    vec3.add(lookAt, this.position, this.direction);
    mat4.lookAt(out, this.position, lookAt, [0, 1, 0]);
    return out;
  }

  getProjectionMatrix() {
    return this.projection;
  }

  getViewProjectionMatrix() {
    const out = this.getViewMatrix();
    mat4.multiply(out, this.projection, out);
    return out;
  }

  moveForward(distance: number) {
    vec3.scaleAndAdd(this.position, this.position, this.direction, distance);
  }

  moveRight(distance: number) {
    const right = vec3.create();
    vec3.rotateY(right, this.direction, [0, 0, 0], glMatrix.toRadian(-90));
    vec3.scaleAndAdd(this.position, this.position, right, distance);
  }

  moveUp(distance: number) {
    vec3.scaleAndAdd(this.position, this.position, [0, 1, 0], distance);
  }

  rotateRight(angle: number) {
    const rotMtx = mat4.create();
    mat4.rotate(rotMtx, rotMtx, -angle, [0, 1, 0]);
    vec3.transformMat4(this.direction, this.direction, rotMtx);
  }

  rotateUp(angle: number) {
    const axis: vec3 = [this.direction[2], 0, -this.direction[0]];
    const rotMtx = mat4.create();
    mat4.rotate(rotMtx, rotMtx, -angle, axis);
    const backup = vec3.clone(this.direction);
    vec3.transformMat4(this.direction, this.direction, rotMtx);
    if (this.direction[1] > 0.95 || this.direction[1] < -0.95) {
      this.direction = backup;
    }
  }
}
