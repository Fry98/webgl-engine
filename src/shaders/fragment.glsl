#version 300 es
precision mediump float;

in vec3 fragNormal;
in vec2 fragTexCoord;

out vec4 outColor;

uniform sampler2D smp;

void main() {
  vec3 ambientLight = vec3(0.3, 0.3, 0.3);
  vec3 sunInt = vec3(1.0, 1.0, 1.0);
  vec3 sunDir = normalize(vec3(4.0, 1.0, 6.0));
  vec3 lightInt = ambientLight + sunInt * max(dot(fragNormal, sunDir), 0.0);

  vec4 texel = texture(smp, fragTexCoord);
  outColor = vec4(texel.rgb * min(lightInt, 1.0), texel.a);
}
