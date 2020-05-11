#version 300 es
precision mediump float;

in vec2 fragTexCoord;

out vec4 outColor;

uniform sampler2D smp;

void main() {
  outColor = texture(smp, fragTexCoord);
}
