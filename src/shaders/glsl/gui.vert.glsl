#version 300 es
precision mediump float;

in vec2 vertPosition;
in vec2 vertTexCoord;

out vec2 fragTexCoord;

uniform float rotAngle;

void main() {
  float sin_factor = sin(rotAngle);
  float cos_factor = cos(rotAngle);
  vec2 offset = vec2(0.5, 0.5);

  fragTexCoord = vertTexCoord;
  fragTexCoord -= offset;
  fragTexCoord = mat2(cos_factor, sin_factor, -sin_factor, cos_factor) * fragTexCoord;
  fragTexCoord += offset;

  gl_Position = vec4(vertPosition, 0.0, 1.0);
}
