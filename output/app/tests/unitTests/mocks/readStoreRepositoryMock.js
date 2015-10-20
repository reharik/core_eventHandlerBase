/**
 * Created by parallels on 9/7/15.
 */
"use strict";

module.exports = function () {
    return {
        getById: function getById(id, table) {
            return {};
        },

        save: function save(table, document, id) {},

        checkIdempotency: function checkIdempotency(originalPosition, eventHandlerName) {
            return { isIdempotent: true, isNewStream: true };
        },

        recordEventProcessed: function recordEventProcessed(originalPosition, eventHandlerName) {}
    };
};