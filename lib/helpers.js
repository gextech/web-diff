function toArray(value) {
  if (typeof value === 'string') {
    return value.split(' ');
  }

  if (!Array.isArray(value)) {
    return [value];
  }

  return value;
}

function doChain(obj, next) {
  var chain = [];

  if (Array.isArray(obj)) {
    obj.forEach(function(v) {
      Array.prototype.push.apply(chain, next(v));
    });
  } else {
    Object.keys(obj).forEach(function(k) {
      Array.prototype.push.apply(chain, next(k, obj[k]));
    });
  }

  return chain;
}

module.exports = {
  toArray: toArray,
  doChain: doChain
};
