#version 300 es
precision mediump float;

in vec3 vertPosition;
in vec3 vertNormal;
in vec2 vertTexCoord;

out vec2 fragTexCoord;
out vec3 fragNormal;

uniform mat4 mWorld;
uniform mat4 mViewProjection;

void main() {
  fragNormal = (mWorld * vec4(vertNormal, 0.0)).xyz;
  fragTexCoord = vertTexCoord;
  gl_Position = mViewProjection * mWorld * vec4(vertPosition, 1.0);
}
