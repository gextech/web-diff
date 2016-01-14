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

function joinValues(data) {
  return data.map(function(item) {
    return item.value;
  }).toString();
}

function testSequence(data) {
  var _ = [];

  function then(cb) {
    _.push(cb);
  }

  var count = 0;

  context.echo('TAP version 13');
  context.echo(Math.min(1, data.count) + '..' + data.count);

  data.tests.forEach(function(test) {
    then(function(next) {
      context.echo('# ' + test.description);
      context.then(next);
    });

    test.asserts.forEach(function(assert) {
      var results = {};

      ['a', 'b'].forEach(function(key) {
        then(function(next) {
          util.log('Open URL : ' + assert[key].url);

          context.thenOpen(assert[key].url, function() {
            util.log('Loaded page title : ' + context.getTitle());
            context.then(next);
          });
        });

        assert[key].steps.forEach(function(step) {
          then(function(next) {
            var value = runAction.call(context, {
              env: env,
              step: step
            });

            if (value) {
              if (!results[key]) {
                results[key] = [];
              }

              results[key].push(value);
            }

            context.then(next);
          });
        });
      });

      then(function(next) {
        var a = joinValues(results.a),
            b = joinValues(results.b);

        var equals = a === b,
            prefix = (!equals ? 'not ' : '') + 'ok ' + (++count),
            message = '`' + a + '` ' + (!equals ? '!' : '=') + '== `' + b + '`';

        context.echo(prefix + ' - ' + message);

        if (!equals) {
          context.echo('  ---');

          ['a', 'b'].forEach(function(key) {
            context.echo('  ' + util.quote(assert[key].url) + ':');
            context.echo(results[key].map(function(action) {
              return [
                '    - ' + action.cmd + ':',
                '        args:',
                '          - ' + action.args.map(util.quote).join('\n          - '),
                '        result: ' + util.quote(action.value)
              ].join('\n');
            }).join('\n'));
          });

          context.echo('  ...');
        }

        context.then(next);
      });
    });
  });

  (function next() {
    var cb = _.shift();

    if (cb) {
      cb(next);
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

testSequence(require(env.DIFF_JSON));

context.run();
