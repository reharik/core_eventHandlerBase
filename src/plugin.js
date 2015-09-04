/**
 * Created by reharik on 8/13/15.
 */

    module.exports = function plugin(eventHandlerBase, extend, logger) {
        return function(_options) {
            var options = extend({}, _options || {});

            return eventHandlerBase;
        };
    };
