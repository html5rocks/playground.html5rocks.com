var map = new GMap2(document.getElementById("content"));
map.setCenter(new GLatLng(37.4419, -122.1419), 13);

// var useThreads = document.getElementById("worker").checked;
// var useThreads = true;
// 
// function Test(name, p) {
//   this.g = ground.newGround(name, p);
//   this.name = name;
//   var self = this;
//   setTimeout(function() {
//     self.go();
//   }, 10);
// };
// Test.prototype = {
//   go: function() {
//     ground.drawPoints(this.g);
//     var opts = {
//       points: this.g.allPoints,
//       t0: 1,
//       g: 0.99,
//       stepsPerT: 10
//     }
//     var listener = {
//       ctx: this.g,
//       name: this.name,
//       onNewMin: function(p) {
//       },
//       onDone: function(p) {
//         ground.clear(this.ctx);
//         ground.drawPath(this.ctx, p);
//         ground.drawPoints(this.ctx);
//       }
//     };
//     var a;
//     if (useThreads)
//       a = new ThreadedAnnealing();
//     else
//       a = new Annealing();
//     a.init(opts, 200, 200, listener);
//     a.go();
//   }
// };
// 
// var t1 = new Test("Test 1", p1);
