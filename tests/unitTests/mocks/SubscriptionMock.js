/**
 * Created by rharik on 6/19/15.
 */

var EventEmitter = require('events').EventEmitter;
var util = require('util');


module.exports = function() {
    return class SubscriptionMock extends EventEmitter {
        constructor() {
            super();
        }
    };
};
