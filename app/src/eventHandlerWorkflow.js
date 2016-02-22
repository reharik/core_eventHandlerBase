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
                          buffer,
                          co, logger) {

    return function(){
        var ef = appfuncs.eventFunctions;
        var fh = appfuncs.functionalHelpers;
        var Future  = _fantasy.Future;

        //ifNotIdemotent:: bool -> JSON
        var ifNotIdemotent = x => x.getOrElse(false) !== true
            ? {
            success   : false,
            errorLevel: 'low',
            message   : "item has already been processed"
        }
            : x.getOrElse(false);

        //isIdempotent:: JSON -> bool
        var isIdempotent = R.compose(R.lift(R.equals(true)), fh.safeProp('isIdempotent'));

        //checkDbForIdempotency  JSON -> Future<string|JSON>
        var checkDbForIdempotency=  R.curry((hName,event) => readstorerepository.checkIdempotency(fh.getSafeValue('originalPosition', event), hName));

        //checkIfProcessed:: JSON -> Future<string|JSON>
        var checkIdempotency = (event,hName) => R.compose(R.map(ifNotIdemotent), R.map(isIdempotent), checkDbForIdempotency(hName))(event);

        var wrapHandlerFunction = (e, f) =>
            co(f(fh.getSafeValue('data', e)))
                .catch(function(err) {
                    logger.error('error thrown: ' + err);
                    return {
                        success   : false,
                        errorLevel: 'severe',
                        message   : 'event handler was unable to complete process: ' + err
                    };
                });

        //recordEventProcessed  bool -> Future<string|JSON>
        var recordEventProcessed = (event,hName) =>  readstorerepository.recordEventProcessed(fh.getSafeValue('originalPosition', event), hName);

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
            return this.fork(e => res(e), r => { res(r)})
        };

        return {
            checkIdempotency,
            wrapHandlerFunction,
            recordEventProcessed,
            notification,
            dispatchSuccess,
            dispatchFailure
        }
    }
};