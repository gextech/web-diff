var casper = require('casper'),
    env = require('system').env;

var runAction = require(env.DIFF_LIB_DIR + '/commands.js')(casper);

function executeSequence(self, seq) {
  var chain = [];

  seq.forEach(function(test) {
    chain.push(function(next) {
      self.echo('>>> ' + test.description);
      next();
    });

    test.sites.forEach(function(site) {
      chain.push(function(next) {
        self.echo('- ' + site.url);

        self.thenOpen(site.url.indexOf('://') > -1 ? site.url : 'http://' + site.url, function() {
          self.echo('# ' + self.getTitle());
          next();
        });
      });

      site.steps.forEach(function(step) {
        chain.push(function(next) {
          runAction.call(self, step);
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
  clientScripts: [
    // TODO: may --debug|info enable this?
    // verbose: true,
    // logLevel: 'debug',
    env.DIFF_LIB_DIR + '/helpers.js'
  ]
}).start();

context.on('remote.message', function(message) {
  // TODO: configure --verbose mode
  this.echo(message);
});

// TODO: enable --ua for this?
// context.userAgent('Mozilla/4.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/4.0)');

executeSequence(context, require(env.DIFF_JSON));

context.run();
