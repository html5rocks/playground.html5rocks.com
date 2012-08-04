/* Convert a NodeList to an Array */
function toArray(nodelist) {
  return Array.prototype.slice.call(nodelist);
}

var flex_children = [
      toArray(document.getElementsByClassName('flex_child_1')),
      toArray(document.getElementsByClassName('flex_child_2'))
    ];

/* Update the displayed size number of inner boxes */
function updateDisplayInfo() {
  var hbox = toArray(document.querySelectorAll('.hbox > *'));
  var vbox = toArray(document.querySelectorAll('.vbox > *'));

  hbox.forEach( function(node) {
    node.innerHTML = 'w: ' + getComputedStyle(node, null).getPropertyValue('width');
  });

  vbox.forEach( function(node) {
    node.innerHTML = 'h: ' + getComputedStyle(node, null).getPropertyValue('height');
  });
}

var button = document.getElementById('switch-button');

button.addEventListener('click', function() {
  if (this.value == 'flex') {
    this.value = 'inflex';
    this.innerHTML = 'Enable Flexibility!';
    flex_children.forEach( function(array) {
      array.forEach( function(node) {
        node.removeAttribute('class');
      });
    });
  } else {
    this.value = 'flex';
    this.innerHTML = 'Disable Flexibility!';
    flex_children.forEach( function(array, index) {
      array.forEach( function(node) {
        node.setAttribute('class', 'flex_child_' + (index + 1));
      });
    });
  }
  updateDisplayInfo();   
}, false);

updateDisplayInfo();
