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
          runAction.call(self, step, next);
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
  // verbose: true,
  // logLevel: 'debug',
  // clientScripts: [
  //   // data.libdir + '/es5.js',
  //   // data.libdir + '/fetch.js',
  //   // data.libdir + '/promise.js'
  // ]
}).start();

context.on('remote.message', function(message) {
  this.echo(message);
});

context.userAgent('Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)');

executeSequence(context, require(env.DIFF_JSON));

context.run();
