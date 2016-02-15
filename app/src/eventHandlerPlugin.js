"use strict";


module.exports = function(coqueue, eventHandlerWorkflow, co) {
    return class eventHandlerBase {
        constructor() {
            this.queue       = new coqueue();
            this.handlerName = '';
            co(function*() {
                while (true) {
                    var value = yield this.queue.next();
                    console.log('==========enter=========');
                    console.log('enter');
                    console.log('==========ENDenter=========');

                    var isIdempotent = handlerReturn(yield value.handlerBase.checkIdempotency(value.event));

                    var eventHandled = handlerReturn(yield value.handlerBase.wrapHandlerFunction(handlerFunction, isIdempotent));

                    var recordEventProcessed = handlerReturn(yield value.handlerBase.wrapRecordEventProcessed(value.event));

                    console.log('==========exit=========');
                    console.log('exit');
                    console.log('==========ENDexit=========');
                    console.log(fu);
                }
            }.bind(this)).catch(function(err) {
                console.log('==========err=========');
                console.log(err);
                console.log('==========ENDerr=========');
            });
        }

        handlerReturn( result ) {
            if(!result){
                throw(new Exception( "function failed to complete."))
            }
            if(result.success === false && errorLevel === 'severe'){
                throw(new Exception(result.message));
            }

            if(result.success === false && errorLevel === 'low'){
                // actually log please
                console.log(result.message);
                return;
            }
            return result;
        }

        handleEvent(event) {
            var handlerBase = eventHandlerWorkflow(this.handlerName, this[event.eventName]);
            console.log('==========handlerBase=========');
            console.log(handlerBase);
            console.log('==========ENDhandlerBase=========');
            this.queue.push({
                event,
                handlerBase
            });
        }
    };
}