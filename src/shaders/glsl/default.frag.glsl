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
uniform vec3 cameraDir;
uniform vec3 fogColor;
uniform vec3 flashlightColor;
uniform vec3 flashAttenParams;

uniform float flashlightInnerCutoff;
uniform float flashlightOuterCutoff;
uniform float shininess;
uniform float specCoef;

uniform int lightCount;
uniform PointLight lights[5];

uniform bool flashlightOn;
uniform bool picked;
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

  // Flashlight
  if (flashlightOn) {
    vec3 unitFlashAttenParams = normalize(flashAttenParams);
    float flashDist = length(fragPosition - cameraPos);
    float theta = dot(normalize(fragPosition - cameraPos), normalize(cameraDir));
    float epsilon = flashlightInnerCutoff - flashlightOuterCutoff;
    float flashInt = clamp((theta - flashlightOuterCutoff) / epsilon, 0.0, 1.0);

    float flashAtten = 1.0 / (
      unitFlashAttenParams.x +
      unitFlashAttenParams.y * flashDist +
      unitFlashAttenParams.z * (flashDist * flashDist)
    );
    lightInt += flashlightColor * flashInt * flashAtten;
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

  // Picked highlight
  if (picked) {
    vec4 highlightColor = vec4(1.0, 1.0, 1.0, 1.0);
    outColor = mix(outColor, highlightColor, 0.4);
  }
}
