#version 300 es
precision mediump float;

in vec3 vertPosition;
in vec2 vertTexCoord;

out vec2 fragTexCoord;

uniform mat4 mViewProjection;

void main() {
  fragTexCoord = vertTexCoord;
  gl_Position = mViewProjection * vec4(vertPosition, 1.0);
}
