var util = require('./helpers'),
    cmdUtil = require('./commands');

function doStep(actions) {
  return util.doChain(actions, function(action) {
    return [ cmdUtil.run({ cmd: action, args: util.toArray(actions[action]) }) ];
  });
}

function setupTest(url, steps) {
  return [ cmdUtil.open({ url: url, steps: util.doChain(steps, doStep) }) ];
}

function createTest(description, sites) {
  return [ cmdUtil.suite({ description: description, sites: util.doChain(sites, setupTest) }) ];
}

module.exports = function(sequence) {
  return util.doChain(sequence, createTest);
};
