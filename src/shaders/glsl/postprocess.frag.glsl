#version 300 es
precision mediump float;

in vec2 fragTexCoord;

out vec4 outColor;

uniform sampler2D smp;

void main() {
  // vec4 diffColor = texture(smp, fragTexCoord);
  // float avg = (diffColor.r + diffColor.g + diffColor.b) / 3.0;
  // outColor = vec4(avg, avg, avg, 1.0);
  outColor = texture(smp, fragTexCoord);
}
