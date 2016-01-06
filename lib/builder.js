var util = require('./helpers');

function doStep(actions) {
  return util.doChain(actions, function(action) {
    return [ { cmd: action, args: util.toArray(actions[action]) } ];
  });
}

function setupTest(url, steps) {
  return [ { url: url, steps: util.doChain(steps, doStep) } ];
}

function createTest(description, sites) {
  return [ { description: description, sites: util.doChain(sites, setupTest) } ];
}

module.exports = function(sequence) {
  return util.doChain(sequence, createTest);
};
