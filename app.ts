const canv = document.getElementById('canv') as HTMLCanvasElement;
const gl = canv.getContext('webgl');
let vertexShader = gl.createShader(gl.VERTEX_SHADER);
let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

Promise.all([
  fetch('/shaders/vertex.glsl'),
  fetch('/shaders/fragment.glsl')
]).then(([req1, req2]) => {
  return Promise.all([req1.text(), req2.text()]);
}).then(([vert, frag]) => {
  gl.shaderSource(vertexShader, vert);
  gl.shaderSource(fragmentShader, frag);
  gl.compileShader(vertexShader);
  gl.compileShader(fragmentShader);
  main();
});

function main() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const verts = [
    0.0, 0.5, 1.0, 0.2, 0.0,
    -0.5, -0.5, 0.0, 1.0, 0.0,
    0.5, -0.5, 0.0, 0.3, 1.0
  ];
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
  const colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
  gl.vertexAttribPointer(
    positionAttribLocation,
    2,
    gl.FLOAT,
    false,
    5 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.vertexAttribPointer(
    colorAttribLocation,
    3,
    gl.FLOAT,
    false,
    5 * Float32Array.BYTES_PER_ELEMENT,
    2 * Float32Array.BYTES_PER_ELEMENT
  );

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation);
  gl.useProgram(program);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
