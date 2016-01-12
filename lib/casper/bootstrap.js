var casper = require('casper'),
    env = require('system').env;

var context = casper.create({
  verbose: true,
  logLevel: env.DIFF_LOG_LEVEL || 'warning',
  clientScripts: [
    env.DIFF_LIB_DIR + '/helpers.js'
  ]
}).start();

var util = {
  quote: function(value) {
    return /[:{}[\],&*#?|\-<>=!%@\\]/.test(value) ? "'" + value + "'" : value;
  },
  find: function(expr) {
    return expr.charAt() === '/' ? casper.selectXPath(expr) : expr;
  },
  log: function(message) {
    if (env.DIFF_LOG_VERBOSE) {
      context.echo('# ' + message.split('\n').join('\n# '));
    }
  }
};

var runAction = require(env.DIFF_LIB_DIR + '/commands.js')(util);

function testSequence(data, cb) {
  context.echo('TODO: ' + JSON.stringify(data, null, 2));
  context.then(cb);
}

function reportSequence(params, results) {
  return function(next) {
    var data = runAction.call(context, params);

    if (data) {
      results.push(data);
    }

    context.then(next);
  };
}

function executeSequence(seq) {
  var chain = [];

  seq.forEach(function(test) {
    var data = [];

    chain.push(function(next) {
      util.log(test.description);
      next();
    });

    test.sites.forEach(function(site) {
      chain.push(function(next) {
        util.log('Open URL : ' + site.url);

        context.thenOpen(site.url.indexOf('://') > -1 ? site.url : 'http://' + site.url, function() {
          util.log('Loaded page title : ' + context.getTitle());
          next();
        });
      });

      site.steps.forEach(function(step) {
        chain.push(reportSequence({
          env: env,
          step: step,
          parent: site.url
        }, data));
      });
    });

    chain.push(function(next) {
      testSequence(data, next);
    });
  });

  (function run() {
    var cb = chain.shift();

    if (typeof cb === 'function') {
      cb(run);
    }
  })();
}


context.on('remote.message', function(message) {
  if (env.DIFF_LOG_VERBOSE) {
    this.echo(message);
  }
});

if (env.DIFF_USER_AGENT) {
  context.userAgent(env.DIFF_USER_AGENT);
}

executeSequence(require(env.DIFF_JSON));

context.run();
