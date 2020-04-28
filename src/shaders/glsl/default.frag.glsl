#version 300 es
precision mediump float;

in vec3 fragNormal;
in vec2 fragTexCoord;

out vec4 outColor;

uniform vec3 ambient;
uniform vec3 sunInt;
uniform vec3 sunPos;
uniform vec3 cameraPos;
uniform float shininess;
uniform float specCoef;
uniform sampler2D smp;

void main() {
  vec3 unitNormal = normalize(fragNormal);
  vec3 unitSunPos = normalize(sunPos);
  vec3 unitCamPos = normalize(cameraPos);

  // Diffuse
  vec3 lightInt = ambient + sunInt * max(dot(unitNormal, unitSunPos), 0.0);
  vec4 texel = texture(smp, fragTexCoord);
  
  // Specular
  vec3 reflected = reflect(-unitSunPos, unitNormal);
  float spec = pow(max(dot(reflected, unitCamPos), 0.0), shininess);
  vec3 specular = specCoef * spec * sunInt;
  lightInt += specular;

  outColor = vec4(texel.rgb * lightInt, texel.a);
}
