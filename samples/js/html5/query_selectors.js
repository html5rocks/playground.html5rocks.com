// Native getElementsByClassName
var els = document.getElementsByClassName('weekday');
var i = els.length;
while (i--) {
  els[i].style.backgroundColor = '#ccc';
}

// Finding elements with CSS syntax (Selectors API)
els = document.querySelectorAll("ul li:nth-child(odd)");
i = els.length;
while (i--) {
  els[i].style.backgroundColor = '#ffa8a8';
}
