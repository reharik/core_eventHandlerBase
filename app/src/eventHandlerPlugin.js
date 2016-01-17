/**
 * Created by reharik on 11/19/15.
 */
"use strict";

module.exports = function(readstorerepository,
                          eventmodels,
                          eventstore,
                          R,
                          _fantasy,
                          uuid,
                          buffer,
                          treis) {

    return function(event, handlerName, handlerFunction){
        var ef = eventmodels.eventFunctions;
        var fh = eventmodels.functionalHelpers;
        var log = function(x){ console.log(x); return x; };

        var Future = _fantasy.Future;

        //checkIfProcessed:: JSON -> Future<string|JSON>
        var checkIfProcessed = function checkIfProcessed(i) {
            return Future((rej, res) => {
                var isIdempotent = R.compose(R.chain(R.equals(true)),fh.safeProp('isIdempotent'));
                if (isIdempotent(i) === true) {
                    res(event);
                } else {
                    rej('item has already been processed');
                }
            })
        };
        //wrapCheckIdempotency  JSON -> Future<string|JSON>
        var wrapCheckIdempotency=  e => readstorerepository.checkIdempotency(e.originalPosition, handlerName);

        //checkIdempotence  JSON -> Future<string|JSON>
        var checkIdempotency = R.compose(R.chain(checkIfProcessed),  wrapCheckIdempotency);

        //wrapRecordEventProcessed  bool -> Future<string|JSON>
        var wrapRecordEventProcessed = e=> readstorerepository.recordEventProcessed(e.originalPosition, handlerName);

//        wrapHandlerFunction: JSON -> Future<string|JSON>
        var wrapHandlerFunction = function wrapHandlerFunction(e) {
            return Future((rej, res) => {
                if (handlerFunction(e) === 'success') {
                    res(e);
                } else {
                    rej('event handler was unable to complete process');
                }
            })
        };

        //application  JSON -> Future<string|JSON>
        var application = R.compose(R.chain(wrapRecordEventProcessed), R.chain(wrapHandlerFunction), checkIdempotency);

        //notification  string -> string -> Future<string|JSON>
        var notification = R.curry((x,y) => {
            var data = {
                result:y,
                message: x,
                initialEvent:event
            };
            var metadata = {
                continuationId: event.continuationId,
                eventName :event.eventName,
                streamType :event.eventName
            };
            notification =  {
                EventId : uuid.v4(),
                Type    : 'notification',
                IsJson  : true,
                // put this in a method on fh
                Data    : new buffer.Buffer(JSON.stringify(data)),
                Metadata: new buffer.Buffer(JSON.stringify(metadata))
            };
            return {
                expectedVersion: -2,
                events         : [notification]
            }
        });

        //append  JSON -> Future<string|JSON>
        var append = R.curry((x) => eventstore.appendToStreamPromise('notification',x));

        //dispatchSuccess  JSON -> Future<string|JSON>
        var dispatchSuccess = R.compose(append, notification('Success'));

        //dispatchFailure  JSON -> Future<string|JSON>
        var dispatchFailure = R.compose(append, notification('Failure'));

        return {
            checkIfProcessed,
            checkIdempotency,
            notification,
            dispatchSuccess,
            dispatchFailure,
            application
        }
    }
};
