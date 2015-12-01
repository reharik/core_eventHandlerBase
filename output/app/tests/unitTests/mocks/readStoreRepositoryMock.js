/**
 * Created by parallels on 9/7/15.
 */
'use strict';

module.exports = function (_fantasy) {
    return {
        getById: function getById(id, table) {
            return {};
        },

        save: function save(table, document, id) {},

        checkIdempotency: function checkIdempotency(originalPosition, eventHandlerName) {
            return _fantasy.Future(function (rej, ret) {
                if (originalPosition.checkResult == 'success') {
                    ret({ isIdempotent: true });
                } else if (originalPosition.checkResult == 'failure') {
                    ret('failure');
                } else if (originalPosition.checkResult == 'error') {
                    rej('checking idempotency resulted in an error');
                } else {
                    throw new Error('Exception');
                }
            });
        },

        recordEventProcessed: function recordEventProcessed(originalPosition, eventHandlerName) {
            return _fantasy.Future(function (rej, ret) {
                if (originalPosition.recordResult == 'success') {
                    ret('Success');
                } else if (originalPosition.recordResult == 'error') {
                    rej('recoding idempotence threw error processing your request');
                } else {
                    throw new Error('Exception');
                }
            });
        }
    };
};