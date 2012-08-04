var gl;
function initGL(canvas) {
  try {
    gl = canvas.getContext("experimental-webgl");
    gl.viewport(0, 0, canvas.width, canvas.height);
  } catch(e) {
  }
  if (!gl) {
    alert("Could not initialise WebGL, sorry :-(");
  }
} 

var crateTextures = []; 
function initTexture() {
  var crateImage = new Image();

  for (var i=0; i < 3; i++) {
    var texture = gl.createTexture();
    texture.image = crateImage;
    crateTextures.push(texture);
  }

  crateImage.onload = function() {
    handleLoadedTexture(crateTextures)
  }
  crateImage.src = "http://playground.html5rocks.com/samples/html5_misc/webgl/crate.gif";
}

var xRot = 0;
var xSpeed = 0;
var yRot = 0;
var ySpeed = 0;
var z = -5.0;
var filter = 0; // 0-3

function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  perspective(45, 1.0, 0.1, 100.0);
  loadIdentity();

  mvTranslate([0.0, 0.0, z]);

  mvRotate(xRot, [1, 0, 0]);
  mvRotate(yRot, [0, 1, 0]);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);


  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, crateTextures[filter]);
  gl.uniform1i(shaderProgram.samplerUniform, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

} 

function tick() {
  handleKeys();
  drawScene();
  animate();
}

function webGLStart() {
  var canvas = document.getElementById("lesson06-canvas");
  initGL(canvas);
  initShaders();
  initBuffers();
  initTexture();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.clearDepth(1.0);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;

  setInterval(tick, 15);
}