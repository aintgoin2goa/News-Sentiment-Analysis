var sentimental = require('Sentimental');
var content = process.argv[2];
var result = sentimental.analyze(content);

process.stdout.write(JSON.stringify(result));

process.exit();

