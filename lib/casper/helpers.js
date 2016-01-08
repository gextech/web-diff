(function() {
  function find(expr) {
    return expr.charAt() === '/'
      ? document.evaluate(expr, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
      : document.querySelector(expr);
  }

  function fire(node, eventName) {
    var event = document.createEvent('HTMLEvents');

    event.initEvent(eventName, false, true);
    node.dispatchEvent(event);
  }

  window.$setNodeValue = function(selector, index) {
    var node = find(selector);

    node.selectedIndex = index;

    fire(node, 'change');
  };
})();
