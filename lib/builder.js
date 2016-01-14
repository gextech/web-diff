function fixURL(url) {
  if (url.indexOf('://') === -1) {
    url = 'http://' + url;
  }

  return url;
}

function toArgs(value) {
  if (typeof value === 'string') {
    return value.split('|').map(function(v) {
      return v.trim();
    });
  }

  if (!Array.isArray(value)) {
    return [value];
  }

  return value;
}

function isArray(obj) {
  return Array.isArray(obj);
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

module.exports = function(data) {
  var result = {
    count: 0,
    tests: []
  };

  var fixedOffset = 0;

  if (!isArray(data)) {
    throw new Error('`data` must be an array');
  }

  data.forEach(function(suite) {
    if (!isObject(suite)) {
      throw new Error('`suite` must be an object');
    }

    Object.keys(suite).forEach(function(test) {
      var urls = suite[test];

      if (!isObject(urls)) {
        throw new Error('`urls` must be an object');
      }

      var key = 0,
          tests = [],
          current = [{}, {}];

      Object.keys(urls).forEach(function(url) {
        var steps = urls[url];

        if (!isArray(steps)) {
          throw new Error('`steps` must be an array');
        }

        current[key].url = fixURL(url);
        current[key].steps = Array.prototype.concat.apply([], steps.map(function(actions) {
          if (!isObject(actions)) {
            throw new Error('`actions` must be an object');
          }

          return Object.keys(actions).map(function(action) {
            return { cmd: action, args: toArgs(actions[action]) };
          });
        }));

        if (key) {
          tests.push({
            a: current[0],
            b: current[1]
          });

          result.count += 1;

          current = [{}, {}];
        }

        key = +(!key);
      });

      result.tests.push({
        description: test,
        asserts: tests
      });
    });
  });

  return result;
};
