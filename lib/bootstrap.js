var casper = require('casper');

function fixURL(link) {
  return link.indexOf('://') > -1 ? link : 'http://' + link;
}

function selector(expr) {
  return expr.charAt() === '/' ? casper.selectXPath(expr) : expr;
}

function runAction(params) {
  switch (params.cmd) {
    case 'get':
      this.echo('$ ' + params.args[0]);
      this.echo(this.fetchText(selector(params.args[0])));
    break;
  }
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

var context = casper.create().start();

executeSequence(context, require('./data.js'));

context.run();
