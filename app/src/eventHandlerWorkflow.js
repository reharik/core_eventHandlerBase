/**
 * Created by reharik on 11/19/15.
 */
"use strict";

module.exports = function(readstorerepository,
                          appfuncs,
                          eventstore,
                          R,
                          _fantasy,
                          uuid,
                          buffer) {

    return function(handlerName, handlerFunction){
        var ef = appfuncs.eventFunctions;
        var fh = appfuncs.functionalHelpers;
        var Future  = _fantasy.Future;

        //checkDbForIdempotency  JSON -> Future<string|JSON>
        var checkDbForIdempotency=  e => readstorerepository.checkIdempotency(fh.getSafeValue('originalPosition', e), handlerName);

        //checkIfProcessed:: JSON -> Future<string|JSON>
        var checkIdempotency = e => {
            //var check = checkDbForIdempotency(e);
            return isIdempotent(checkDbForIdempotency(e)) === true
                ? Future.of(e)
                : Future.reject({success:false, errorLevel:'low', message:"item has already been processed"});
        };

        //isIdempotent:: JSON -> bool
        var isIdempotent = R.compose(R.chain(R.equals(true)), fh.safeProp('isIdempotent'));

        // wrapHandlerFunction: JSON -> Future<string|JSON>
        var wrapHandlerFunction = R.curry((e, f) => {
            return f(e) === 'success'
                ? Future.of(e)
                : Future.reject({success:false, errorLevel:'severe', message:'event handler was unable to complete process'});
        });

        //wrapRecordEventProcessed  bool -> Future<string|JSON>
        var wrapRecordEventProcessed = e => readstorerepository.recordEventProcessed(fh.getSafeValue('originalPosition', e), handlerName);

        //application  JSON -> Future<string|JSON>
        var application = R.compose(R.chain(wrapRecordEventProcessed), R.chain(wrapHandlerFunction(handlerFunction)), checkIdempotency);

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

        Future.prototype.then = function(res,rej){
            return this.fork(e => res(e), r => res(r))
        };

        return {
            checkIdempotency,
            notification,
            dispatchSuccess,
            dispatchFailure,
            application
        }
    }
};