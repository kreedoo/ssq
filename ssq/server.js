var express = require('express');
var $kd = require('./kdLotteryFilter.js');

var port = 8040;
var uri = 'http://localhost:' + port;

var app = express();

var server = app.listen(port, function(error){
    if(error){
        console.log(error);
        return;
    }

    console.log('Listening at: ' + uri);
});

// static
app.use(express.static('./dist'));
// router
app.get('/fetch/history', function(req, res){
    $kd.$h.fetch(true);
});
