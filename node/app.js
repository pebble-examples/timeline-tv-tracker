var express = require('express');
var date = require('date.js');
var Timeline = require('pebble-api');

var app = express();
app.set('port', (process.env.PORT || 5000));

// create a new Timeline object with our API key keys passed as an enviornment variable
var timeline = new Timeline({
  apiKey: process.env.PEBBLE_TIMELINE_API_KEY
});

var topic = 'GameOfThrones';
var currentPeopleWatching = 0;

// create the pin
var pin = new Timeline.Pin({
  id: topic + '-S05E00',
  time: date('tomorrow at 9pm'),
  layout: new Timeline.Pin.Layout({
    type: Timeline.Pin.LayoutType.GENERIC_PIN,
    tinyIcon: Timeline.Pin.Icon.PIN,
    title: 'Game of Thrones',
    body: 'People currently watching: ' + currentPeopleWatching
  })
});

// add actions to the pin
pin.addAction(new Timeline.Pin.Action({
  type: Timeline.Pin.ActionType.OPEN_WATCH_APP,
  title: 'Start Watching',
  launchCode: 1
})).addAction(new Timeline.Pin.Action({
  type: Timeline.Pin.ActionType.OPEN_WATCH_APP,
  title: 'Stop Watching',
  launchCode: 2
}));


// handler for GET /
app.get('/', function (req, res) {
  res.send('People currently watching: ' + currentPeopleWatching);
});

// handler for GET /:topic/start
app.get('/:topic/start', function (req, res, next) {

  // increment currentPeopleWatching
  currentPeopleWatching++;

  // once done, continue to next handler so we don't duplicate code
  next();
});

// handler for GET /:topic/stop
app.get('/:topic/stop', function (req, res, next) {

  // decrement currentPeopleWatching but not less than 0
  currentPeopleWatching--;
  if (currentPeopleWatching < 0) {
    currentPeopleWatching = 0;
  }

  // once done, continue to next handler so we don't duplicate code
  next();
});

// handler for /:topic/*
app.get('/:topic/*', function (req, res) {

  // update the pin time
  pin.time = date('tomorrow at 9pm');

  // update the pin body
  pin.layout.body = 'People currently watching: ' + currentPeopleWatching;

  // send the pin to everyone subscribed to it
  timeline.sendSharedPin([topic], pin, function (err, body, resp) {
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
