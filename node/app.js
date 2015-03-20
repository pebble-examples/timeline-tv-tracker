var express = require('express');
var date = require('date.js');
var Timeline = require('pebble-api');

var app = express();
app.set('port', (process.env.PORT || 5000));

var timeline = new Timeline({
  apiKey: process.env.PEBBLE_TIMELINE_API_KEY
});

var currentPeopleWatching = 0;

var topics = ['GameOfThrones'];

var pinId = 'gameofthrones-pin-2';

var now = new Date();

var startAction = new Timeline.Pin.Action({
  type: Timeline.Pin.ActionType.OPEN_WATCH_APP,
  title: 'Start Watching',
  launchCode: 1
});

var stopAction = new Timeline.Pin.Action({
  type: Timeline.Pin.ActionType.OPEN_WATCH_APP,
  title: 'Stop Watching',
  launchCode: 2
});

function getPinLayout() {
  return new Timeline.Pin.Layout({
    type: Timeline.Pin.LayoutType.GENERIC_PIN,
    tinyIcon: Timeline.Pin.Icon.PIN,
    title: 'Game Of Thrones',
    body: 'Current people watching: ' + currentPeopleWatching
  });
}

// handler for GET /
app.get('/', function (req, res) {
  res.send('Current people watching: ' + currentPeopleWatching);
});

app.get('/subscribe/:topic', function (req, res) {
  // create the pin object
  var pin = new Timeline.Pin({
    id: pinId,
    time: date('30 min'),
    layout: getPinLayout()
  });

  // add actions
  pin.addAction(startAction);
  pin.addAction(stopAction);

  // send the pin to everyone subscribed
  timeline.sendSharedPin(topics, pin, function (err, body, resp) {
    if (err) {
      return console.error(err);
    }

    res.send('Status code: ' + resp.statusCode);
  });
});

app.get('/start/:topic', function (req, res) {
  currentPeopleWatching++;

  // create the pin object
  var pin = new Timeline.Pin({
    id: pinId,
    time: date('tomorrow at 9pm'),
    layout: getPinLayout()
  });

  // add actions
  pin.addAction(startAction);
  pin.addAction(stopAction);

  // send the pin to everyone subscribed
  timeline.sendSharedPin(topics, pin, function (err, body, resp) {
    if (err) {
      return console.error(err);
    }

    res.send('Status code: ' + resp.statusCode);
  });
});

app.get('/stop/:topic', function (req, res) {
  currentPeopleWatching--;
  if (currentPeopleWatching < 0) currentPeopleWatching = 0;

  // create the pin object
  var pin = new Timeline.Pin({
    id: pinId,
    time: date('tomorrow at 9pm'),
    layout: getPinLayout()
  });

  // add actions
  pin.addAction(startAction);
  pin.addAction(stopAction);

  // send the pin to everyone subscribed
  timeline.sendSharedPin(topics, pin, function (err, body, resp) {
    if (err) {
      return console.error(err);
    }

    res.send('Status code: ' + resp.statusCode);
  });
});

// start the webserver
var server = app.listen(app.get('port'), function () {
  console.log('timeline-tv-tracker example app listening on port %s', app.get('port'));
});
