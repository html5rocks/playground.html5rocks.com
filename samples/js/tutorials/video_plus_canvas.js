var video_dom = document.querySelector('#video-canvas-fancy');
var canvas_copy = document.querySelector('#canvas-copy-fancy');
var canvas_draw = document.querySelector('#canvas-draw-fancy');
var draw_interval = null;
var ctx_copy = null;
var ctx_draw = null;

var offsets = [];
var inertias = [];
var slices = 4;
var out_padding = 100;
var interval = null;

var inertia = -2.0;

video_dom.addEventListener('canplay', function() {
  canvas_copy.width = canvas_draw.width = video_dom.videoWidth;
  canvas_copy.height = video_dom.videoHeight;
  canvas_draw.height = video_dom.videoHeight + out_padding;
  ctx_copy = canvas_copy.getContext('2d');
  ctx_draw = canvas_draw.getContext('2d');
}, false);


for (var i = 0; i < slices; i++) {
  offsets[i] = 0;
  inertias[i] = inertia;
  inertia += 0.4;
}

video_dom.addEventListener('play', function() {
  processEffectFrame();
  if (interval == null) {
    interval = window.setInterval(function() { processEffectFrame() }, 33);
  }        
}, false);

function processEffectFrame() {
  var slice_width = video_dom.videoWidth / slices;
  ctx_copy.drawImage(video_dom, 0 ,0);
  ctx_draw.clearRect(0, 0,  canvas_draw.width, canvas_draw.height);
  for (var i = 0; i < slices; i++) {
    var sx = i * slice_width;
    var sy = 0;
    var sw = slice_width;
    var sh = video_dom.videoHeight;
    var dx = sx;
    var dy = offsets[i] + sy + out_padding;
    var dw = sw;
    var dh = sh;
    ctx_draw.drawImage(canvas_copy, sx, sy, sw, sh, dx, dy, dw, dh);
    if (Math.abs(offsets[i] + inertias[i]) < out_padding) {
      offsets[i] += inertias[i];
    } else {
      inertias[i] = -inertias[i];
    }
  }
};

video_dom.addEventListener('pause', function() {
  window.clearInterval(interval);
  interval = null;
}, false);

video_dom.addEventListener('ended', function() {
  clearInterval(interval);
}, false);  
