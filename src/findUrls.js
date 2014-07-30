var spawn = require("child_process").spawn;
var path = require('path');

var phantomPath = path.join(__dirname + '../bin/phantomjs');

spawn(phantomPath);


