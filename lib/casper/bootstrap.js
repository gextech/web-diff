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

var lastData,
    lastCount = 0;

function reportSequence(params) {
  return function(next) {
    var data = runAction.call(context, params);

    if (!(env.DIFF_LOG_VERBOSE || env.DIFF_LOG_LEVEL)) {
      if (lastData) {
        var a = lastData.value,
            b = data.value;

        var prefix = ((a !== b) ? 'not ' : ' ') + 'ok ' + (lastCount + 1),
            message = '`' + a + '` ' + (a !== b ? '!' : '=') + '== `' + b + '`';

        context.echo(prefix + ' - ' + message);

        if (a !== b) {
          context.echo('  ---');
          [lastData, data].forEach(function(test) {
            context.echo('  ' + util.quote(test.url) + ':');
            context.echo('    action: ' + test.cmd);
            context.echo('    params:');
            context.echo('      - ' + test.args.map(util.quote).join('\n      - '));
            context.echo('    result: ' + util.quote(test.value));
          });
          context.echo('  ...');
        }

        lastData = null;
        lastCount += 1;
      } else {
        lastData = data;
      }
    }

    context.then(next);
  };
}

function executeSequence(seq) {
  var count = 0,
      chain = [];

  seq.forEach(function(test) {
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
        count += 1;
        chain.push(reportSequence({
          env: env,
          step: step,
          parent: site.url
        }));
      });
    });
  });

  if (!(env.DIFF_LOG_VERBOSE || env.DIFF_LOG_LEVEL)) {
    var tests = count / 2;

    context.echo('TAP version 13');
    context.echo(Math.min(1, tests) + '..' + tests);
  }

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
