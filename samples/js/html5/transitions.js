var content = document.querySelector('#content');
content.innerHTML = 'click here to animate';
content.addEventListener('click', function() {
  window.console && console.log(this)
  if (this.className == "right") {
    this.className = "left";
  }
  else {
    this.className = 'right';
  }
}, false);
