///**
// * Created by rharik on 6/18/15.
// */
//"use strict";
//
//module.exports = function(eventstore, readstorerepository, eventmodels, Promise, logger) {
//    return function() {
//        var handleEvent = function(state) {
//            var idempotency = checkIdempotency(state);
//            if (!idempotency) {
//                return;
//            }
//            idempotency
//                .then(createNotification)
//                .then(handleEventBody)
//                .then(recordEventProcessed)
//                .catch(handleException).bind(this)
//                .then(dispatchResult)
//        };
//
//        var checkIdempotency = function(state) {
//            logger.debug('handleEvent | checking event for idempotence');
//            readstorerepository.checkIdempotency(state.vent.originalPosition, state.eventHandlerName)
//                .then(function(err, data) {
//                    if (!err && data.isIdempotent) {
//                        state.idempotency = data;
//                        return new Promise(state);
//                    }
//                    logger.debug('handleEvent | event is not idempotent');
//                    return false;
//                    // check to make sure this is returning false;
//                });
//        };
//
//        var handleEventBody = function(state) {
//            var vent = state.vent;
//            logger.info('handleEvent | calling specific event handler for: ' + vent.eventName + ' on ' + state.eventHandlerName);
//            state.handlers[vent.eventName](vent.data, vent.metadata.continuationId)
//            .then(function(){ return state; });
//        };
//
//        var recordEventProcessed = function(state) {
//            logger.trace('handleEvent | event Handled by: ' + state.vent.eventName + ' on ' + state.eventHandlerName);
//            return readstorerepository.recordEventProcessed(state.vent.originalPosition, state.eventHandlerName, state.idempotency.isNewStream);
//        };
//
//        var createNotification = function(state) {
//            logger.debug('createNotification | building response notification');
//            state.responseMessage = eventmodels.notificationEvent("Success", "Success", state.vent);
//            logger.trace('createNotification | getting continuation Id: ' + state.responseMessage.continuationId);
//            return state;
//        };
//
//        var handleException = function(exception) {
//            logger.error('handleEvent | event: ' + this.state.vent.friendlyDisplay() + ' threw exception: ' + exception);
//            var responseMessage = eventmodels.notificationEvent("Failure", exception.message, this.state.vent);
//            dispatchResult({notification:responseMessage});
//        };
//
//        var dispatchResult = function(state) {
//            logger.trace('handleEvent | beginning to process responseMessage');
//            var responseEvent = state.notification.toEventData();
//            logger.debug('handleEvent | response event created: ' + responseEvent.friendlyDisplay());
//
//            var appendData = {
//                expectedVersion: -2,
//                events         : [responseEvent]
//            };
//
//            logger.debug('handleEvent | event data created: ' + appendData);
//            logger.trace('handleEvent | publishing notification');
//            return eventstore.appendToStreamPromise('notification', appendData);
//
//        };
//    }
//};
