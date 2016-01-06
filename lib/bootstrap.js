var casper = require('casper').create();

console.log('DATA', JSON.stringify(require('./data.js')));

casper.start().run();
