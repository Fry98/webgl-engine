import { vec3, mat4, glMatrix } from "gl-matrix";

export enum View {
  FREE,
  VIEW_1,
  VIEW_2
}

export default class Camera {
  private state = View.FREE;
  private direction = vec3.create();
  private projection = mat4.create();
  private position: vec3;
  private posOld: vec3;

  constructor(position: vec3, direction: vec3, fov: number) {
    this.position = position;
    this.posOld = position;

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

  getDirection() {
    return this.direction;
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

  getState() {
    return this.state;
  }

  moveForward(distance: number) {
    if (this.state !== View.FREE) return;
    vec3.scaleAndAdd(this.position, this.position, this.direction, distance);
  }

  moveRight(distance: number) {
    if (this.state !== View.FREE) return;
    const right = vec3.create();
    vec3.rotateY(right, this.direction, [0, 0, 0], glMatrix.toRadian(-90));
    vec3.scaleAndAdd(this.position, this.position, right, distance);
  }

  moveUp(distance: number) {
    if (this.state !== View.FREE) return;
    vec3.scaleAndAdd(this.position, this.position, [0, 1, 0], distance);
  }

  rotateRight(angle: number) {
    if (this.state !== View.FREE) return;
    const rotMtx = mat4.create();
    mat4.rotate(rotMtx, rotMtx, -angle, [0, 1, 0]);
    vec3.transformMat4(this.direction, this.direction, rotMtx);
  }

  rotateUp(angle: number) {
    if (this.state !== View.FREE) return;
    const axis: vec3 = [this.direction[2], 0, -this.direction[0]];
    const rotMtx = mat4.create();
    mat4.rotate(rotMtx, rotMtx, -angle, axis);
    const backup = vec3.clone(this.direction);
    vec3.transformMat4(this.direction, this.direction, rotMtx);
    if (this.direction[1] > 0.95 || this.direction[1] < -0.95) {
      this.direction = backup;
    }
  }

  revert() {
    this.position = [...this.posOld] as vec3;
  }

  persist() {
    this.posOld = [...this.position] as vec3;
  }

  switchView() {
    // TODO: New camera views
    switch (this.state) {
      case View.FREE:
        this.position = [-77.52, -2.12, 21.58];
        this.direction = [0.47, -0.22, 0.86];
        this.state = View.VIEW_1;
        break;
      case View.VIEW_1:
        this.position = [-77.86, 3.26, 252.04];
        this.direction = [0.49, -0.44, -0.75];
        this.state = View.VIEW_2;
        break;
      case View.VIEW_2:
        this.state = View.FREE;
        break;
    }
  }
}
