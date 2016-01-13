/* global $setNodeValue */

var env = require('system').env;

var filters = require(env.DIFF_LIB_DIR + '/filters.js');

function apply(value, args) {
  args.forEach(function(filter) {
    if (filters[filter]) {
      value = filters[filter](value);
    }
  });

  return value;
}

function data(params, extra) {
  var obj = {
    cmd: params.step.cmd,
    args: params.step.args
  };

  for (var k in extra) {
    obj[k] = extra[k];
  }

  return obj;
}

module.exports = function(util) {
  return function(params) {
    var k = params.step.args[0], v;

    switch (params.step.cmd) {
      case 'get':
        v = apply(this.fetchText(util.find(k)), params.step.args.slice(1));

        util.log('Fetch text from ' + k + ' : ' + v);

        return data(params, {
          value: v
        });

      case 'set':
        v = params.step.args[1];

        util.log('Set value for ' + k + ' : ' + v);

        this.thenEvaluate(function() {
          $setNodeValue.apply(null, arguments);
        }, k, v);

        break;

      case 'eval':
        util.log('Eval : ' + params.step.args.join('\n'));

        return data(params, {
          result: this.thenEvaluate(params.step.args.join('\n'))
        });

      case 'wait':
        util.log('Waiting for ' + k + ' ms');
        this.wait(k);

        break;

      case 'debug':
        switch (k) {
          case 'html':
            this.debugHTML();
            break;

          case 'page':
          default:
            this.debugPage();
        }
        break;

      case 'screen':
        v = params.env.DIFF_SCREEN_DIR + '/' + k + '.png';

        util.log('Screenshot taken : ' + v);
        this.capture(v);

        break;

      case 'click':
        v = this.click(util.find(k));
        util.log('Click on ' + k + ' : ' + v);

        break;
    }
  };
};
