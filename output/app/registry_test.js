/**
 * Created by parallels on 9/3/15.
 */
'use strict';

var dagon = require('dagon');
var path = require('path');

module.exports = function (_options) {
    var options = _options || {};
    var container = dagon(options.dagon);
    return new container(function (x) {
        return x.pathToRoot(path.join(__dirname, '..')).requireDirectoryRecursively('./app/src').requireDirectoryRecursively('./app/tests/unitTests/mocks')['for']('bluebird').renameTo('Promise')['for']('corelogger').renameTo('logger').instantiate(function (i) {
            return i.asFunc().withParameters(options.logger || {});
        })['for']('eventmodels').instantiate(function (i) {
            return i.asFunc();
        })['for']('readstorerepository').require('./app/tests/unitTests/mocks/readStoreRepositoryMock')['for']('eventstore').require('./app/tests/unitTests/mocks/eventStoreMock').complete();
    });
};