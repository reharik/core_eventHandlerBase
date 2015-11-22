/**
 * Created by reharik on 11/19/15.
 */

module.exports = function(readstorerepository,
                          eventmodels,
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

        var handleEventCurried = R.curry((e,i) => handlerFunction(e,i))(event);

        var handleEvent = R.compose(R.chain(handleEventCurried), checkIdempotency);

        var recordEventCurried = R.curry((e,i)=>readstorerepository.recordEventProcessed(e,i))(event);

        var recordEvent = R.compose(R.chain(recordEventCurried), handleEvent);

        var notification = R.curry((x,y,z) => {
            var data = {
                result:x,
                message: y,
                initialEvent:z
            };
            var metadata = {
                continuationId: z.continuationId,
                eventName :z.eventName,
                streamType :z.eventName
            };
            return {
                EventId : uuid.v4(),
                Type    : 'notification',
                IsJson  : true,
                Data    : new buffer.Buffer(JSON.stringify(data)),
                Metadata: new buffer.Buffer(JSON.stringify(metadata))
            }
        });

        // this is provided by the repository or the distributer



        return {
            checkIfProcessed,
            checkIdempotency,
            handleEvent,
            recordEvent,
            notification
        }
    }
};