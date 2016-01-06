function toArray(value) {
  return Array.isArray(value) ? value : value.split(' ');
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
