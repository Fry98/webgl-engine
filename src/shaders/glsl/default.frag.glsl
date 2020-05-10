#version 300 es
precision mediump float;

struct PointLight {
  vec3 pos;
  vec3 color;
  vec3 atten;
};

in vec3 fragPosition;
in vec3 fragNormal;
in vec2 fragTexCoord;
in float visibility;

out vec4 outColor;

uniform vec3 ambient;
uniform vec3 sunInt;
uniform vec3 sunPos;
uniform vec3 cameraPos;
uniform vec3 fogColor;

uniform float shininess;
uniform float specCoef;
uniform int lightCount;
uniform PointLight lights[5];

uniform sampler2D smp;

void main() {

  // Normalization
  vec3 unitNormal = normalize(fragNormal);
  vec3 unitSunPos = normalize(sunPos);
  vec3 unitCamPos = normalize(cameraPos);

  // Directional Lights
  vec3 lightInt = ambient + sunInt * max(dot(unitNormal, unitSunPos), 0.0);
  vec4 texel = texture(smp, fragTexCoord);

  // Point Lights
  for (int i = 0; i < lightCount; i++) {
    vec3 unitAtten = normalize(lights[i].atten);
    float dist = length(lights[i].pos - fragPosition);

    float attenuation = 1.0 / (
      unitAtten.x +
      unitAtten.y * dist +
      unitAtten.z * (dist * dist)
    );
    lightInt += lights[i].color * attenuation;
  }

  // Specular (Sun only)
  vec3 reflected = reflect(-unitSunPos, unitNormal);
  float spec = pow(max(dot(reflected, unitCamPos), 0.0), shininess);
  vec3 specular = specCoef * spec * sunInt;
  lightInt += specular;

  // Fog
  vec4 unitFogColor = vec4(fogColor.x / 255.0, fogColor.y / 255.0, fogColor.z / 255.0, 1.0);
  outColor = vec4(texel.rgb * lightInt, texel.a);
  outColor = mix(unitFogColor, outColor, visibility);
}
