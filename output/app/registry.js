/**
 * Created by parallels on 9/3/15.
 */
var dagon = require('dagon');
var path = require('path');

module.exports = function (_options) {
    var options = _options || {};
    var container = dagon(options.dagon);
    return new container(x => x.pathToRoot(path.join(__dirname, '..')).requireDirectoryRecursively('./app/src').for('bluebird').renameTo('Promise').for('corelogger').renameTo('logger').instantiate(i => i.asFunc().withParameters(options.logger || {})).for('eventmodels').instantiate(i => i.asFunc()).for('eventstore').instantiate(i => i.asFunc().withParameters(options || {})).for('readstorerepository').instantiate(i => i.asFunc().withParameters(options || {})).complete());
};