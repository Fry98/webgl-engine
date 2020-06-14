#version 300 es
precision mediump float;

in vec2 vertPosition;
in vec2 vertTexCoord;

out vec2 fragTexCoord;

uniform mat2 mAnim;

void main() {
  vec2 offset = vec2(0.5, 0.5);

  fragTexCoord = vertTexCoord;
  fragTexCoord -= offset;
  fragTexCoord = mAnim * fragTexCoord;
  fragTexCoord += offset;

  gl_Position = vec4(vertPosition, 0.0, 1.0);
}
