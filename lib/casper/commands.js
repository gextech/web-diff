/* global $setNodeValue */

module.exports = function(casper) {
  function x(expr) {
    return expr.charAt() === '/' ? casper.selectXPath(expr) : expr;
  }

  return function(env, params, debug) {
    switch (params.cmd) {
      case 'get':
        debug('Fetch text from ' + params.args[0] + ' : ' + this.fetchText(x(params.args[0])));
        break;

      case 'set':
        debug('Set value for ' + params.args[0] + ' : ');
        this.thenEvaluate(function() {
          $setNodeValue.apply(null, arguments);
        }, params.args[0], +params.args[1]);
        break;

      case 'eval':
        debug('Eval : ' + params.args.join('\n'));
        this.thenEvaluate(params.args.join('\n'));
        break;

      case 'wait':
        debug('Waiting for ' + params.args[0] + ' ms');
        this.wait(params.args[0]);
        break;

      case 'debug':
        switch (params.args[0]) {
          case 'html':
            this.debugHTML();
            break;

          case 'page':
          default:
            this.debugPage();
        }
        break;

      case 'screen':
        var image = env.DIFF_SCREEN_DIR + '/' + params.args[0] + '.png';
        debug('Screenshot taken : ' + image);
        this.capture(image);
        break;

      case 'click':
        debug('Click on ' + params.args[0] + ' : ' + this.click(x(params.args[0])));
        break;
    }
  };
};
