if (!sessionStorage['counter']) {
  sessionStorage['counter'] = 0;
} else {
  sessionStorage['counter']++;
}

document.querySelector('#content').innerHTML = 
    '<p>This sample has been run ' + sessionStorage.getItem('counter') + ' times</p>' +
    '<p>(The value will be available until we close the tab)</p>';