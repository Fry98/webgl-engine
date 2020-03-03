precision mediump float;

varying vec3 fragNormal;
varying vec2 fragTexCoord;

uniform sampler2D smp;

void main() {
  vec3 ambientLight = vec3(0.15, 0.15, 0.15);
  vec3 sunInt = vec3(0.9, 0.9, 0.9);
  vec3 sunDir = normalize(vec3(4.0, 1.0, 6.0));
  vec3 lightInt = ambientLight + sunInt * max(dot(fragNormal, sunDir), 0.0);

  vec4 texel = texture2D(smp, fragTexCoord);
  gl_FragColor = vec4(texel.rgb * lightInt, texel.a);
}
