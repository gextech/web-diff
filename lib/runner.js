var util = require('./helpers');

function doStep(actions) {
  return util.doChain(actions, function(action) {
    return [{ cmd: action, args: util.toArray(actions[action]) }];
  });
}

function setupTest(url, steps) {
  console.log('URL', url);

  return util.doChain(steps, doStep);
}

function createTest(description, sites) {
  console.log('TEST', description);

  return util.doChain(sites, setupTest);
}

function runSequence(sequence, cb) {
  var chain = util.doChain(sequence, createTest);

  console.log(JSON.stringify(chain, null, 2));

  cb();
}

module.exports = {
  start: runSequence
};
