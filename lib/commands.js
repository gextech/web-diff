function selector(expr) {
  return expr.charAt() === '/' ? casper.selectXPath(expr) : expr;
}

module.exports = function(params) {
  var self = this;
  this.wait(1000, function() {
    switch (params.cmd) {
      case 'get':
        self.echo('$get   :  ' + self.fetchText(selector(params.args[0])));
      break;
      case 'click':
        self.echo('$ click :  ' + self.click(selector(params.args[0])));
      break;
    }
  });
};
