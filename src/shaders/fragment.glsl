precision mediump float;

varying vec3 fragNormal;

void main() {
  vec3 ambientLight = vec3(0.1, 0.1, 0.1);
  vec3 sunInt = vec3(0.9, 0.9, 0.9);
  vec3 sunDir = normalize(vec3(4.0, 1.0, 6.0));
  
  vec3 lightInt = ambientLight + sunInt * max(dot(fragNormal, sunDir), 0.0);
  vec3 color = vec3(1.0, 1.0, 1.0);
  gl_FragColor = vec4(color * lightInt, 1.0);
}
