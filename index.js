/**
 * Created by parallels on 9/3/15.
 */
var extend = require('extend');
var bootstrapper = require('./bootstrapper');

module.exports = function(_options) {
    var options = {
        logger: {
            moduleName: 'EventHandlerBase'
        }
    };
    extend(options, _options || {});
    var container = bootstrapper(options);
    var plugin = container.getInstanceOf('eventHandlerBase');

    return plugin(options);
};
