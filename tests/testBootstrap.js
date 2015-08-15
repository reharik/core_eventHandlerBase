/**
 * Created by rharik on 6/23/15.
 */
var bootstrap = require('dagon');
module.exports = new bootstrap(x=>
    x.pathToRoot(__dirname + '../')
        .requireDirectoryRecursively('./src')
        .for('gesConnection').instantiate(i=> i.initializeWithMethod('openConnection'))
        .for('logger').require("/unitTests/mocks/logger")
        .for('SubscriptionMock').require("/unitTests/mocks/SubscriptionMock")
        .for('testAgg').require("/unitTests/mocks/testAgg")
        .for('testAggNoCMDHandlers').require("/unitTests/mocks/testAggNoCMDHandlers")
        .for('testAggNoEventHandlers').require("/unitTests/mocks/testAggNoEventHandlers")
        .for('TestEventHandler').require("/unitTests/mocks/TestEventHandler")
        .for('gesclient').require("/unitTests/mocks/gesClientMock")
        .for('readModelRepository').require("/unitTests/mocks/readModelRepositoryMock")
        .rename('lodash').withThis('_')
        .rename('bluebird').withThis('Promise')
        .complete());


