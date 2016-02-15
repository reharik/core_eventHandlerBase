"use strict";


module.exports = function(coqueue, eventHandlerWorkflow, co) {
    return class eventHandlerBase {
        constructor() {
            this.queue       = new coqueue();
            this.handlerName = '';
            co(function*() {
                while (true) {
                    var value = yield this.queue.next();

                    var isIdempotent = this.handlerReturn(yield value.handlerBase.checkIdempotency(value.event));
                    console.log('==========isIdempotent=========');
                    console.log(isIdempotent);
                    console.log('==========ENDisIdempotent=========');

                    var eventHandled = isIdempotent === true ? this.handlerReturn(yield value.handlerBase.wrapHandlerFunction(value.event,value.handlerFunction)):'';
                    console.log('==========eventHandled=========');
                    console.log(eventHandled);
                    console.log('==========ENDeventHandled=========');
                    var recordEventProcessed = this.handlerReturn(yield value.handlerBase.wrapRecordEventProcessed(value.event));
                    console.log('==========recordEventProcessed=========');
                    console.log(recordEventProcessed);
                    console.log('==========ENDrecordEventProcessed=========');

                }
            }.bind(this)).catch(function(err) {
                console.log('==========err=========');
                console.log(err);
                console.log('==========ENDerr=========');
            });
        }
        handlerReturn( result ) {

            if(!result){
                throw(new Error( "function failed to complete."))
            }
            if(result.success === false && errorLevel === 'severe'){
                throw(new Error(result.message));
            }

            if(result.success === false && errorLevel === 'low'){
                // actually log please
                console.log(result.message);
                return;
            }
            return result;
        }

        handleEvent(event) {
            var handlerFunction = this[event.eventName];
            var handlerBase = eventHandlerWorkflow(this.handlerName, handlerFunction);

            this.queue.push({
                event,
                handlerBase,
                handlerFunction

            });
        }
    };
}