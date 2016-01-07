var casper = require('casper');

var runAction = require('./lib/commands.js');

function fixURL(link) {
  return link.indexOf('://') > -1 ? link : 'http://' + link;
}

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

        self.thenOpen(fixURL(site.url), function() {
          self.echo('# ' + self.getTitle());

          site.steps.forEach(function(step) {
            runAction.call(self, step);
          });

          next();
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
  verbose: true,
  logLevel: "debug"
}).start();

executeSequence(context, require('./data.js'));

context.run();
