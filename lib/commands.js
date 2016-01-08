var casper = require('casper');

function selector(expr) {
  return expr.charAt() === '/' ? casper.selectXPath(expr) : expr;
}

module.exports = function(params, next) {
  switch (params.cmd) {
    case 'get':
      this.echo('$get   :  ' + this.fetchText(selector(params.args[0])));
      next();
    break;
    case 'eval':
      this.echo('---');
      this.echo(params.args.join('\n'));
      this.echo('---');
      this.evaluate(new Function('', params.args.join('\n')));
      // this.evaluate(function() {
      //   console.log('WHAT THE FUCK?');
      //   console.log('fetch', typeof fetch);
      //   console.log('Promise', typeof Promise);
      //   // next();
      // });
      next();
    break;
    case 'wait':
      this.echo('... ' + params.args[0]);
      this.wait(params.args[0], next);
    break;
    case 'debug':
      this.debugHTML();
      next();
    break;
    case 'screen':
      this.echo('! ' + params.args[0]);
      this.capture('screenshots/' + params.args[0] + '.png');
      next();
    break;
    case 'click':
      this.echo('$ click :  ' + this.click(selector(params.args[0])));
      next();
    break;
  }
};
