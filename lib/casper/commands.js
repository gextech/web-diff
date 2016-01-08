/* global $setNodeValue */

function data(params, extra) {
  var obj = {
    url: params.parent,
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
        v = this.fetchText(util.find(k));

        util.log('Fetch text from ' + k + ' : ' + v);

        return data(params, {
          value: v
        });

      case 'set':
        util.log('Set value for ' + k + ' : ');

        this.thenEvaluate(function() {
          $setNodeValue.apply(null, arguments);
        }, k, +params.step.args[1]);

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

        return data(params, {
          result: v
        });
    }
  };
};
