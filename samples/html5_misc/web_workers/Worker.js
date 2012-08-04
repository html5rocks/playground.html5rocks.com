// importScripts('samples/html5_misc/web_workers/annealing.js');

// var annealing = new Annealing();

onmessage = function(event) {
  postMessage(["onDone", p]);
  // var method = event.data[0];
  // 
  // if (method == "init") {
  //   var args = event.data[1];
  // 
  //   var listener = {
  //     onNewMin: function(p) {
  //       postMessage(["onNewMin", p]);
  //     },
  //     onDone: function(p) {
  //       postMessage(["onDone", p]);
  //     }
  //   };
  // 
  //   annealing.init(args.opts, args.width,
  //                  args.height, listener);
  // }
  // if (method == "go") {
  //   annealing.go();
  // }
}

