#version 300 es
precision mediump float;

in vec2 fragTexCoord;

out vec4 outColor;

uniform int noiseChannel;
uniform int mode;
uniform sampler2D smp;
uniform sampler2D noise;

void dither() {
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

void rgb_split() {
  float red = texture(smp, vec2(fragTexCoord.x, fragTexCoord.y - 0.002)).r;
  float green = texture(smp, vec2(fragTexCoord.x + 0.0005, fragTexCoord.y)).g;
  float blue = texture(smp, vec2(fragTexCoord.x, fragTexCoord.y)).b;
  float alpha = texture(smp, vec2(fragTexCoord.x, fragTexCoord.y)).a;
  outColor = vec4(red, green, blue, alpha);
}

void main() {
  switch (mode) {
    case 0:
      outColor = texture(smp, fragTexCoord);
      break;
    case 1:
      rgb_split();
      break;
    case 2:
      dither();
      break;
  }
}
