/**
 * Created by reharik on 11/19/15.
 */

module.exports = function(readstorerepository,
                          eventmodels,
                          eventstore,
                          R,
                          _fantasy,
                          uuid,
                          buffer,
                          treis) {

    return function(event, handlerFunction){
        var ef = eventmodels.eventFunctions;
        var fh = eventmodels.functionalHelpers;
        var log = function(x){ console.log(x); return x; };

        var Future = _fantasy.Future;

        //checkIfProcessed:: JSON -> Future<string|JSON>
        var checkIfProcessed = function checkIfProcessed(i) {
            return Future((rej, res) => {
                var isIdempotent = R.compose(log, R.chain(R.equals(true)),fh.safeProp('isIdempotent'));
                if (isIdempotent(i) === true) {
                    res(i);
                } else {
                    rej('item has already been processed');
                }
            })
        };

        //checkIdempotence  JSON -> Future<string|JSON>
        var checkIdempotency = R.compose(R.chain(checkIfProcessed), readstorerepository.checkIdempotency);

        //handleEventCurried  JSON -> Future<string|JSON>
        var handleEventCurried = R.curry((i) => handlerFunction(event,i));

        //handleEvent  JSON -> Future<string|JSON>
        var handleEvent = R.compose(R.chain(handleEventCurried), checkIdempotency);

        //recordEventCurried  JSON -> Future<string|JSON>
        var recordEventCurried = R.curry((i)=>readstorerepository.recordEventProcessed(event,i));

        //recordEvent  JSON -> Future<string|JSON>
        var application = R.compose(R.chain(recordEventCurried), handleEvent);

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
            handleEvent,
                notification,
            dispatchSuccess,
            dispatchFailure,
            application
        }
    }
};