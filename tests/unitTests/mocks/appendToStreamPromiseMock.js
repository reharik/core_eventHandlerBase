/**
 * Created by rharik on 6/12/15.
 */

var Promise = require('bluebird');
module.exports = function(bluebird) {
    var streamName = '';
    var appendData = {};
    return function (_streamName, _appendData, extraData) {
        streamName = _streamName;
        appendData = _appendData;
        return Promise.resolve({
            streamName: streamName,
            appendData: appendData
        })
    }
};