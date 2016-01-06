var casper = require('casper');

function runFactory(params) {
  params.cb = function() {
    console.log('RUN', JSON.stringify(params));
  };

  return params;
}

function openFactory(params) {
  params.cb = function() {
    console.log('OPEN', params.url);
    return this.thenOpen(params.url, function() {
      console.log('END?');
    });
  };

  return params;
}

function suiteFactory(params) {
  params.cb = function() {
    console.log('TEST', params.description);
  };

  return params;
}

function executeSequence(seq, cb) {
  var chain = [];

  seq.forEach(function(test) {
    chain.push(suiteFactory(test));

    test.sites.forEach(function(site) {
      chain.push(openFactory(site));

      site.steps.forEach(function(step) {
        chain.push(runFactory(step));
      });
    });
  });

  cb(chain);
}

var sequence = require('./data.js');

executeSequence(sequence, function(actions) {
  var context = casper.create().start();

  actions.forEach(function(action) {
    context = action.cb.call(context) || context;
  });

  context.run();
});
