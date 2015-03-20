var context = new (window.AudioContext || window.webkitAudioContext);

var audioTotal = 0;
var currentSynth = false;

function downloadAudio() {
  var http = new XMLHttpRequest();

  http.onreadystatechange = function () {
    if (http.readyState === 4 && http.status === 200) {
      var audioArr = JSON.parse(http.responseText);

      for (var i = 0; i < audioArr.length; i ++) {
        if (!audioArr[i].data) {
          continue;
        }

        localforage.setItem('audio-' + i, {
          data: 'data:audio/wav;base64,' + audioArr[i].data,
          synth: audioArr[i].synth
        }, function (err) {
          if (err) {
            console.log('error: ', err);
          }
        });
      }

      document.querySelector('#loader').classList.add('hide');

      localforage.setItem('downloaded', audioArr.length, function (err) {
        if (err) {
          console.log('error: ', err);
          return;
        }

        audioTotal = audioArr.length;
      });
    } else {
      console.log('error ', http.status)
    }
  };

  http.open('GET', '/audio', true);
  http.send();
};

function init() {
  localforage.getItem('downloaded', function (err, total) {
    if (err || !total) {
      downloadAudio();
      return;
    }

    document.querySelector('#loader').classList.add('hide');

    audioTotal = total;
  });
}

function playRandomAudio() {
  var rand = Math.floor(Math.random() * audioTotal);

  localforage.getItem('audio-' + rand, function (err, sample) {
    if (sample) {
      document.querySelector('#result').textContent = '';
      document.querySelector('#answer').removeAttribute('disabled');
      document.querySelector('#generate').setAttribute('disabled', 'disabled');
      currentSynth = sample.synth;
      var audio = new Audio(sample.data);
      audio.play();
    }
  });
};

function displaySynth() {
  document.querySelector('#result').textContent = currentSynth;
  document.querySelector('#generate').removeAttribute('disabled');
  document.querySelector('#answer').setAttribute('disabled', 'disabled');
}

init();

