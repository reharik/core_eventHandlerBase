/**
 * Created by rharik on 6/23/15.
 */
var container = require('dagon');
console.log(__dirname);
module.exports =  new container(x=>
    x.pathToRoot(__dirname)
        .requireDirectoryRecursively('./src')
        .requireDirectory('./unitTests/mocks')
        .for('gesConnection').instantiate(x=>x.initializeWithMethod('openConnection'))
        .rename('lodash').withThis('_')
        .rename('bluebird').withThis('Promise')
        .for('TestAgg').require("/unitTests/mocks/testAgg")
        .for('TestEventHandler').require("/unitTests/mocks/TestEventHandler")
        .for('NotificationHandler').require("/unitTests/mocks/NotificationHandler")
        .for('readModelRepository').require("/unitTests/mocks/readModelRepositoryMock")
        //.for('readModelRepository').instantiate(x=>x.asFunc()).require("/src/postgres/postgresRepository")
        //.for('readModelRepository').require("/src/postgres/postgresRepository")
        .complete());
