//Setup web server and socket
var twitter = require('twit'),
  express = require('express'),
  app = express(),
  http = require('http'),
  server = http.createServer(app),
  io = require('socket.io').listen(server);

//Setup twitter stream api
var twit = new twitter({
    consumer_key: 'cADM7b6gJH6UW7QWt7KMU2a0q',
    consumer_secret: 'KxzqcRGLWPcdZcLB6HpOOX95YSSiHmojG56YAd8sxKj1Cziekk',
    access_token: '38526776-yUreJUKOl04LFxs4EirSA3hyLQLKa7WC9UsF1rUTW',
    access_token_secret: 'NATVXWZspY1v2nFGc9p1vubqU7ROgYNDUyWJii6BARuUN'
  }),
  stream = null;

//Use the default port (for beanstalk) or default to 8081 locally
server.listen(process.env.PORT || 8080);

app.use(express.static(__dirname + '/public'));

io.sockets.on('connection', function(socket) {
  console.log('connected');
  socket.on('start tweets', function() {
    console.log('tweets started');
    if(stream === null) {
      stream = twit.stream('statuses/filter', {locations:'-68.09,43.19,-59.31,48.04'});

      stream.on('tweet', function (data) {
        var tweetData;
        if (data.coordinates) {
          tweetData = {point: {lng: data.coordinates.coordinates[0], lat: data.coordinates.coordinates[1]}, userName: data.user.screen_name, text: data.text};
          socket.emit('twitter-point', tweetData);
        } else if (data.place) {
          if (data.place.bounding_box === 'Polygon') {
            // Calculate the center of the bounding box for the tweet
            var coord, _i, _len;
            var centerLat = 0;
            var centerLng = 0;

            for (_i = 0, _len = coords.length; _i < _len; _i++) {
              coord = coords[_i];
              centerLat += coord[0];
              centerLng += coord[1];
            }
            centerLat = centerLat / coords.length;
            centerLng = centerLng / coords.length;

            // Build json object and broadcast it
            tweetData = {point: {lng: centerLng, lat: centerLat}, userName: data.user.screen_name, text: data.text};
            socket.broadcast.emit("twitter-stream", tweetData);

          }
        }
      });
      stream.on('limit', function (limitMessage) {
        return console.log(limitMessage);
      });

      stream.on('warning', function (warning) {
        return console.log(warning);
      });

      stream.on('disconnect', function (disconnectMessage) {
        return console.log(disconnectMessage);
      });
    }

  });
});