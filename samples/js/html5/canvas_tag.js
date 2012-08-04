var ctx = document.getElementById('paint_area').getContext('2d');

ctx.fillStyle = '#cc3300';
ctx.fillRect(0,0,200,200);

ctx.rotate(.2);
var img_buffer = document.createElement('img');
img_buffer.src = 'http://playground.html5rocks.com/images/normal_plus.png';
img_buffer.onload = function() { ctx.drawImage(img_buffer,50,0,100,100); }

/* this is only for mouse interaction */
var down = false;
ctx.canvas.addEventListener('mousedown', function() { down = true; }, false);
ctx.canvas.addEventListener('mouseup', function() { down = false; }, false);
ctx.canvas.addEventListener('mousemove', function(event) { 
  if (down) {
    ctx.translate(0,-50); 
    ctx.drawImage(img_buffer, event.clientX - this.offsetLeft,
                         event.clientY - this.offsetTop,100,100);
    ctx.translate(0,50);
   }
}, false);
