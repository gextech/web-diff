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

function joinValues(set) {
  return set.values.map(function(item) {
    return item.value;
  }).toString();
}

function testSequence(data, cb) {
  context.echo('TAP version 13');
  context.echo(Math.min(1, data.length) + '..' + data.length);

  data.forEach(function(test, i) {
    var a = joinValues(test.result[0]),
        b = joinValues(test.result[1]);

    var equals = a === b,
        prefix = (!equals ? 'not ' : '') + 'ok ' + (i + 1),
        message = '`' + a + '` ' + (!equals ? '!' : '=') + '== `' + b + '`';

    context.echo('# ' + test.label);
    context.echo(prefix + ' - ' + message);

    if (!equals) {
      context.echo('  ---');

      test.result.forEach(function(result) {
        context.echo('  ' + util.quote(result.url) + ':');
        context.echo(result.values.map(function(action) {
          return [
            '    - ' + action.cmd + ':',
            '        args:',
            '          - ' + action.args.map(util.quote).join('\n        - '),
            '        result: ' + util.quote(action.value),
          ].join('\n');
        }).join('\n'));
      });

      context.echo('  ...');
    }
  });

  context.then(cb);
}

function executeSequence(seq) {
  var data = [],
      chain = [],
      offset = 0;

  var then = Array.prototype.push.bind(chain);

  seq.forEach(function(test) {
    var lastPair = [{}, {}];

    test.sites.forEach(function(site) {
      then(function(next) {
        if (site.url.indexOf('://') === -1) {
          site.url = 'http://' + site.url;
        }

        lastPair[offset].url = site.url;

        util.log('Open URL : ' + site.url);

        context.thenOpen(site.url, function() {
          util.log('Loaded page title : ' + context.getTitle());
          next();
        });
      });

      site.steps.forEach(function(step) {
        then(function(next) {
          if (!lastPair[offset].values) {
            lastPair[offset].values = [];
          }

          var result = runAction.call(context, {
            env: env,
            step: step
          });

          if (result) {
            lastPair[offset].values.push(result);
          }

          context.then(next);
        });
      });

      then(function(next) {
        if (offset) {
          data.push({
            label: test.description,
            result: lastPair
          });
          lastPair = [{}, {}];
          next();
        }

        offset = +(!offset);

        next();
      });
    });
  });

  then(function(next) {
    testSequence(data, next);
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
