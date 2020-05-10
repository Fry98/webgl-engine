#version 300 es
precision mediump float;

in vec3 vertPosition;

uniform mat4 mWorld;
uniform mat4 mViewProjection;

void main() {
  gl_Position = mViewProjection * mWorld * vec4(vertPosition, 1.0);
}
