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
        var Future  = _fantasy.Future;

        var log     = (x) => {
            console.log('==========log=========');
            console.log(x);
            console.log('==========ENDlog=========');
            return x;
        };
        var logPlus     = R.curry((y,x) => {
            console.log('==========log '+y+'=========');
            console.log(x);
            console.log('==========ENDlog '+y+'=========');
            return x;
        });
        var logForkPlus = R.curry((y,x)  => {
            var fr, sr;
            x.fork(f=> {
                    console.log('==========log failure ' + y + '=========');
                    console.log(f);
                    console.log('==========ENDlog failure ' + y + '=========');
                    fr = f;
                },
                    s=> {
                    console.log('==========log success ' + y + '=========');
                    console.log(s);
                    console.log('==========ENDlog success ' + y + '=========');
                    sr = s;
                });

            return sr ? Future((rej, res)=> res(sr)) : Future((rej, res)=> rej(fr));
        });
        var logFork = x  => {
            var fr, sr;
            x.fork(f=> {
                    console.log('==========log failure=========');
                    console.log(f);
                    console.log('==========ENDlog failure=========');
                    fr = f;
                },
                    s=> {
                    console.log('==========log success=========');
                    console.log(s);
                    console.log('==========ENDlog success=========');
                    sr = s;
                });

            return sr ? Future((rej, res)=> res(sr)) : Future((rej, res)=> rej(fr));
        };

        //checkIfProcessed:: JSON -> Future<string|JSON>
        var checkIfProcessed = function checkIfProcessed(i) {
            var isIdempotent = R.compose(R.chain(R.equals(true)), fh.safeProp('isIdempotent'));
            return isIdempotent(i) === true
                ? Future.of(event)
                : Future.reject("item has already been processed");
        };
        //wrapCheckIdempotency  JSON -> Future<string|JSON>
        var wrapCheckIdempotency=  e => readstorerepository.checkIdempotency(e.originalPosition, handlerName);

        //checkIdempotence  JSON -> Future<string|JSON>
        var checkIdempotency = R.compose(R.chain(checkIfProcessed), wrapCheckIdempotency);

        //wrapRecordEventProcessed  bool -> Future<string|JSON>
        var wrapRecordEventProcessed = e=> readstorerepository.recordEventProcessed(e.originalPosition, handlerName);

        // wrapHandlerFunction: JSON -> Future<string|JSON>
        var wrapHandlerFunction = function wrapHandlerFunction(e) {
            return handlerFunction(e) === 'success'
                ? Future.of(e)
                : Future.reject('event handler was unable to complete process');
        };

        //application  JSON -> Future<string|JSON>
        var application = x=> {
            var app = R.compose(R.chain(wrapRecordEventProcessed), R.chain(wrapHandlerFunction), checkIdempotency);
            app(x).fork(logPlus('app failure'),logPlus('app success'))
        };

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
