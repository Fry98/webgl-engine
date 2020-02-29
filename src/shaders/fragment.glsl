precision mediump float;

varying vec2 fragTexCoord;
uniform sampler2D smp;

void main() {
  gl_FragColor = texture2D(smp, fragTexCoord);
}
