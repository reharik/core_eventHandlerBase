/**
 * Created by parallels on 9/3/15.
 */
var container = require('dagon');

module.exports = function(_options) {
    var options = _options || {};

    return new container(x=>
        x.pathToRoot(__dirname)
            .requireDirectoryRecursively('./src')
            .for('bluebird').renameTo('Promise')
            .for('corelogger').renameTo('logger').instanciate(i=>i.asFunc().withParameters(options.logger || {}))
            .complete());
};
