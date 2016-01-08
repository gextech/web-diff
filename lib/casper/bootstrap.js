var casper = require('casper'),
    env = require('system').env;

var util = {
  find: function(expr) {
    return expr.charAt() === '/' ? casper.selectXPath(expr) : expr;
  }
};

var runAction = require(env.DIFF_LIB_DIR + '/commands.js');

function executeSequence(self, seq) {
  var chain = [],
      values = [];

  util.log = function(message) {
    if (env.DIFF_LOG_VERBOSE) {
      self.echo('> ' + message);
    }
  };

  var exec = runAction(util);

  seq.forEach(function(test) {
    chain.push(function(next) {
      util.log(test.description);
      next();
    });

    test.sites.forEach(function(site) {
      chain.push(function(next) {
        util.log('Open URL : ' + site.url);

        self.thenOpen(site.url.indexOf('://') > -1 ? site.url : 'http://' + site.url, function() {
          util.log('Loaded page title : ' + self.getTitle());
          next();
        });
      });

      site.steps.forEach(function(step) {
        chain.push(function(next) {
          values.push(exec.call(self, {
            env: env,
            step: step,
            parent: site.url
          }));
          self.then(next);
        });
      });
    });
  });

  chain.push(function(next) {
    // TODO: test test test!
    console.log('TAP ' + JSON.stringify(values, null, 2));
    next();
  });

  (function run() {
    var cb = chain.shift();

    if (typeof cb === 'function') {
      cb(run);
    }
  })();
}


var context = casper.create({
  verbose: true,
  logLevel: env.DIFF_LOG_LEVEL,
  clientScripts: [
    env.DIFF_LIB_DIR + '/helpers.js'
  ]
}).start();

context.on('remote.message', function(message) {
  if (env.DIFF_LOG_VERBOSE) {
    this.echo(message);
  }
});

if (env.DIFF_USER_AGENT) {
  context.userAgent(env.DIFF_USER_AGENT);
}

executeSequence(context, require(env.DIFF_JSON));

context.run();
