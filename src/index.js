/**
 * Created by reharik on 8/13/15.
 */

    var eventHandlerBase = require('eventHandlerBase');
    var extend = require('extend');
    var yowlWrapper = require('yowlWrapper');

    module.exports = function index(eventStore, readStoreRepository, _options) {
        var options = {
            logger: {
                moduleName: "EventHandlerBase"
            }
        };
        extend(options, _options || {});

        var logger = yowlWrapper(options.logger);
        return eventHandlerBase(eventStore, readStoreRepository, logger, options);
    };