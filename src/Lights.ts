import { vec3 } from "gl-matrix";

export interface LightMap {
  ambient: vec3,
  directional: {
    intensity: vec3,
    position: vec3
  }
}
