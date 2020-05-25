import { vec3, mat4, glMatrix } from "gl-matrix";

export default class GameObject {
  private position: vec3;
  private rotation: vec3;
  private rotMat: mat4;
  private scale: vec3;

  constructor(position: vec3, rotation: vec3, scale: vec3) {
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    
    this.rotMat = mat4.create();
    mat4.rotateX(this.rotMat, this.rotMat, glMatrix.toRadian(this.rotation[0]));
    mat4.rotateY(this.rotMat, this.rotMat, glMatrix.toRadian(this.rotation[1]));
    mat4.rotateZ(this.rotMat, this.rotMat, glMatrix.toRadian(this.rotation[2]));
  }

  move(movement: vec3) {
    this.position[0] += movement[0];
    this.position[1] += movement[1];
    this.position[2] += movement[2];
  }

  scaleUp(factor: number) {
    this.scale = this.scale.map((x: number) => x + factor) as vec3;
  }

  getWorldMatrix(radius?: number, duration?: number) {
    const mWorld = mat4.create();
    
    if (duration === undefined) {
      mat4.translate(mWorld, mWorld, this.position);
    } else {
      const state = performance.now() / 1000 / duration;
      const angle = Math.PI * 2 * state;
      const offX = Math.sin(angle) * radius;
      const offZ = Math.cos(angle) * radius;

      mat4.translate(mWorld, mWorld, [this.position[0] + offX, this.position[1], this.position[2] + offZ]);
      mat4.rotate(mWorld, mWorld, angle + Math.PI / 2, [0, 1, 0]);
    }

    mat4.scale(mWorld, mWorld, this.scale);
    mat4.multiply(mWorld, mWorld, this.rotMat);
    return mWorld;
  }
}
