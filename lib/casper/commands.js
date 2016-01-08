/* global $setSelectedIndex */

module.exports = function(casper) {
  function selector(expr) {
    return expr.charAt() === '/' ? casper.selectXPath(expr) : expr;
  }

  return function(env, params) {
    switch (params.cmd) {
      case 'get':
        this.echo('$get ' + params.args[0] + ' :  ' + this.fetchText(selector(params.args[0])));
      break;
      case 'set':
        this.thenEvaluate(function() {
          $setSelectedIndex.apply(null, arguments);
        }, params.args[0], +params.args[1]);
      break;
      case 'eval':
        this.echo('---');
        this.echo(params.args.join('\n'));
        this.echo('---');
        this.thenEvaluate(params.args.join('\n'));
      break;
      case 'wait':
        this.echo('... ' + params.args[0]);
        this.wait(params.args[0]);
      break;
      case 'debug':
        this.debugHTML();
      break;
      case 'screen':
        this.echo('! ' + params.args[0]);
        this.capture(env.DIFF_SCREEN_DIR + '/' + params.args[0] + '.png');
      break;
      case 'click':
        this.echo('$ click :  ' + this.click(selector(params.args[0])));
      break;
    }
  };
};
