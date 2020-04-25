#version 300 es
precision mediump float;

in vec3 vertPosition;

out vec3 fragTexCoord;

uniform mat4 mView;
uniform mat4 mProjection;

void main() {
  fragTexCoord = vertPosition;
  vec4 pos = mProjection * mView * vec4(vertPosition, 1.0);
  gl_Position = pos.xyww;
}
