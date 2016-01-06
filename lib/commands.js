var Async = require('async-parts');

function runFactory(params) {
  params.callback = function(next) {
    console.log('RUN');
    next();
  };

  return params;
}

function openFactory(params) {
  params.callback = function(next) {
    console.log('OPEN');
    next();
  };

  return params;
}

function suiteFactory(params) {
  params.callback = function(next) {
    console.log('SUITE');
    next();
  };

  return params;
}

function executeSequence(args, cb) {
  var chain = new Async();

  args.forEach(function(test) {
    chain.then(test.callback);

    test.sites.forEach(function(site) {
      chain.then(site.callback);

      site.steps.forEach(function(step) {
        chain.then(step.callback);
      });
    });
  });

  chain.run(function() {
    cb();
  });
}

module.exports = {
  run: runFactory,
  open: openFactory,
  suite: suiteFactory,
  execute: executeSequence
};
