#version 300 es
precision mediump float;

in vec3 vertPosition;
in vec3 vertNormal;
in vec2 vertTexCoord;

out vec2 fragTexCoord;
out vec3 fragNormal;
out float visibility;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProjection;

uniform float fogDensity;

void main() {
  fragNormal = (mWorld * vec4(vertNormal, 0.0)).xyz;
  fragTexCoord = vertTexCoord;

  vec4 coordsToCamera = mView * mWorld * vec4(vertPosition, 1.0);
  float distFromCam = length(coordsToCamera.xyz);
  visibility = -pow((distFromCam * fogDensity), 1.2);
  visibility = clamp(exp(visibility), 0.0, 1.0);

  gl_Position = mProjection * coordsToCamera;
}
