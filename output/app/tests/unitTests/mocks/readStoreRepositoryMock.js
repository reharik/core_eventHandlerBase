/**
 * Created by parallels on 9/7/15.
 */
module.exports = function () {
    return {
        getById(id, table) {
            return {};
        },

        save(table, document, id) {},

        checkIdempotency(originalPosition, eventHandlerName) {
            return { isIdempotent: true, isNewStream: true };
        },

        recordEventProcessed(originalPosition, eventHandlerName) {}
    };
};