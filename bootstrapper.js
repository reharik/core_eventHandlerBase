/**
 * Created by parallels on 9/3/15.
 */
var container = require('dagon');

module.exports = function(_options) {
    var options = _options || {};

    return new container(x=>
        x.pathToRoot(__dirname)
            .requireDirectoryRecursively('./src')
            .rename('bluebird').withThis('Promise')
            .rename('corelogger').withThis('logger')
            .for('logger').instanciate(i=>i.asFunc().withParameters(options.logger || {}))
            .complete());
};
