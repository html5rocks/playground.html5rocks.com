var movie = document.getElementById('video_with_controls');
document.getElementById('play').addEventListener('click', function() { movie.play(); }, false);
document.getElementById('pause').addEventListener('click', function() { movie.pause(); }, false);
document.getElementById('duration').addEventListener('click', function() { document.querySelector('#duration-log').textContent = movie.duration; }, false);
