// set this to where the server is running
var API_ROOT = 'http://localhost:5000';

var topic = 'GameOfThrones';

function startWatching() {
  var xhr = new XMLHttpRequest();

  // construct the url for the api
  var url = API_ROOT + '/' + topic + '/start';

  xhr.open('GET', url, true);
  xhr.onload = function() {
    console.log('startWatching server response: ' + xhr.responseText);

    // Update text on the watch to say we've sent the pin
    Pebble.sendAppMessage({text: 'Pin updated!'});

    // set a timer to quit the app in 2 seconds
    setTimeout(function() {
      Pebble.sendAppMessage({quit: true});
    }, 2000);
  };

  xhr.send();
}

function stopWatching() {
  var xhr = new XMLHttpRequest();

  // construct the url for the api
  var url = API_ROOT + '/' + topic + '/stop';

  xhr.open('GET', url, true);
  xhr.onload = function() {
    console.log('stopWatching server response: ' + xhr.responseText);

    // Update text on the watch to say we've sent the pin
    Pebble.sendAppMessage({text: 'Pin updated!'});

    // set a timer to quit the app in 2 seconds
    setTimeout(function() {
      Pebble.sendAppMessage({quit: true});
    }, 2000);
  };

  xhr.send();
}

function subscribe() {
  var xhr = new XMLHttpRequest();

  // construct the url for the api
  var url = API_ROOT + '/' + topic + '/subscribe';

  xhr.open('GET', url, true);
  xhr.onload = function() {
    console.log('subscribe server response: ' + xhr.responseText);

    // Update text on the watch to say we've sent the pin
    Pebble.sendAppMessage({text: 'Subscribed!', ready: true});

    // set a timer to quit the app in 2 seconds
    setTimeout(function() {
      Pebble.sendAppMessage({quit: true});
    }, 2000);
  };

  xhr.send();
}

// ready event
Pebble.addEventListener('ready', function(e) {

  Pebble.sendAppMessage({text: 'Subscribing to ' + topic + ' topic...'});

  Pebble.timelineSubscribe(topic, function () {
    console.log('Subscribed to ' + topic);

    // subscribe to server to get the pin
    subscribe();

  }, function (error) {
    console.log('Error subscribing to topic: ' + error);
  });
});

Pebble.addEventListener('appmessage', function(e) {
  console.log('Received message: ' + JSON.stringify(e.payload));

  if (e.payload.action) {
    switch (e.payload.action) {
      case 1:
        Pebble.sendAppMessage({text: 'Start Watching\nUpdating pin...'});
        startWatching();
        break;

      case 2:
        Pebble.sendAppMessage({text: 'Stop Watching\nUpdating pin...'});
        stopWatching();
        break;
    }
  }
});
