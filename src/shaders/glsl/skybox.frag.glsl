#version 300 es
precision mediump float;

in vec3 fragTexCoord;

out vec4 outColor;

uniform samplerCube smp;

void main() {
  outColor = texture(smp, fragTexCoord);
}
