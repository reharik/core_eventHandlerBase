"use strict";


module.exports = function(coqueue, eventHandlerWorkflow, co) {
    return class eventHandlerBase {
        constructor() {
            this.queue       = new coqueue();
            this.handlerName = '';
            this.workflow = eventHandlerWorkflow();

            co(function*() {
                while (true) {
                    var value = yield this.queue.next();

                    var isIdempotent = this.handlerReturn(yield this.workflow.checkIdempotency(value.event, this.handlerName));
                    console.log('==========isIdempotent=========');
                    console.log(isIdempotent);
                    console.log('==========ENDisIdempotent=========');

                    var eventHandled = isIdempotent === true ? this.handlerReturn(yield this.workflow.wrapHandlerFunction(value.event,value.handlerFunction)):'';
                    console.log('==========eventHandled=========');
                    console.log(eventHandled);
                    console.log('==========ENDeventHandled=========');
                    var recordEventProcessed = isIdempotent === true ? this.handlerReturn(yield this.workflow.recordEventProcessed(value.event, this.handlerName)):'';
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
            if(result.success === false && result.errorLevel === 'severe'){
                throw(new Error(result.message));
            }

            if(result.success === false && result.errorLevel === 'low'){
                // actually log please
                console.log(result.message);
                return result.message;
            }
            return result;
        }

        handleEvent(event) {
            var handlerFunction = this[event.eventName];
            this.queue.push({
                event,
                handlerFunction
            });
        }
    };
}