#version 300 es
precision mediump float;

in vec2 fragTexCoord;

out vec4 outColor;

uniform int noiseChannel;
uniform sampler2D smp;
uniform sampler2D noise;

void main() {
  vec4 diffColor = texture(smp, fragTexCoord);
  float avg = (diffColor.r + diffColor.g + diffColor.b) / 3.0;

  float noiseVal;
  vec4 noisePixel = texture(noise, fract(gl_FragCoord.xy / 64.0));
  switch (noiseChannel) {
    case 0:
      noiseVal = noisePixel.r;
      break;
    case 1:
      noiseVal = noisePixel.g;
      break;
    case 2:
      noiseVal = noisePixel.b;
      break;
    case 3:
      noiseVal = noisePixel.a;
      break;
  }

  if (avg >= noiseVal) {
    outColor = vec4(1.0, 1.0, 1.0, 1.0);
  } else {
    outColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
}
