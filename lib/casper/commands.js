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
          function $(expr) {
            return expr.charAt() === '/'
              ? document.evaluate(expr, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
              : document.querySelector(expr);
          }

          console.log('FIND', arguments[0]);
          console.log('SET', arguments[1]);

          // TODO: use helpers to encapsulate this shit
          // console.log('>>', foo());

          var node = $(arguments[0]);

          node.selectedIndex = arguments[1];

          try {
            var event = document.createEvent('HTMLEvents');

            event.initEvent('change', false, true);
            node.dispatchEvent(event);
          } catch (e) {
            console.log('FAILED --- createEvent(change)', e);

            try {
              node.fireEvent('onchange');
            } catch (e2) {
              console.log('FAILED --- fireEvent(onchange)', e2);
            }
          }

          console.log('OK');
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
