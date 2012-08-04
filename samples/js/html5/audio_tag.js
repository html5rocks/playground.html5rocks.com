var song = document.getElementById('audio_with_controls');
document.getElementById('play').addEventListener('click', function() { song.play(); }, false);
document.getElementById('pause').addEventListener('click', function() { song.pause(); }, false);
document.getElementById('duration').addEventListener('click', function() { document.querySelector('#duration-log').textContent = song.duration; }, false);
