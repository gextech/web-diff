var casper = require('casper'),
    env = require('system').env;

var runAction = require(env.DIFF_LIB_DIR + '/commands.js')(casper);

function executeSequence(self, seq) {
  var chain = [];

  function debug(message) {
    if (env.DIFF_LOG_VERBOSE) {
      self.echo('[ ' + message + ' ]');
    }
  }

  seq.forEach(function(test) {
    chain.push(function(next) {
      debug(test.description);
      next();
    });

    test.sites.forEach(function(site) {
      chain.push(function(next) {
        debug('Open URL : ' + site.url);

        self.thenOpen(site.url.indexOf('://') > -1 ? site.url : 'http://' + site.url, function() {
          debug('Loaded page title : ' + self.getTitle());
          next();
        });
      });

      site.steps.forEach(function(step) {
        chain.push(function(next) {
          runAction.call(self, env, step, debug);
          self.then(next);
        });
      });
    });
  });

  (function run() {
    var cb = chain.shift();

    if (typeof cb === 'function') {
      cb(run);
    }
  })();
}


var context = casper.create({
  // TODO: may --debug|info enable this?
  verbose: true,
  logLevel: env.DIFF_LOG_LEVEL,
  clientScripts: [
    env.DIFF_LIB_DIR + '/helpers.js'
  ]
}).start();

context.on('remote.message', function(message) {
  // TODO: configure --verbose mode
  if (env.DIFF_LOG_VERBOSE) {
    this.echo(message);
  }
});

// TODO: enable --ua for this?
// context.userAgent('Mozilla/4.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/4.0)');

executeSequence(context, require(env.DIFF_JSON));

context.run();
