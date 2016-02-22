"use strict";


module.exports = function(coqueue, eventHandlerWorkflow, logger, co) {
    return class eventHandlerBase {
        constructor() {
            this.queue       = new coqueue();
            this.handlerName = '';
            this.workflow = eventHandlerWorkflow();

            co(function*() {
                while (true) {
                    var value = yield this.queue.next();
                    logger.trace(this.handlerName + ' ' + value.event);
                    var isIdempotent = this.handlerReturn(yield this.workflow.checkIdempotency(value.event, this.handlerName));
                    logger.trace('message for ' + this.handlerName + ' isIdempotent ' + isIdempotent);

                    var eventHandled = isIdempotent === true ? this.handlerReturn(yield this.workflow.wrapHandlerFunction(value.event,value.handlerFunction)):'';
                    logger.trace('message for ' + this.handlerName + ' was handled ' + eventHandled);

                    var recordEventProcessed = isIdempotent === true ? this.handlerReturn(yield this.workflow.recordEventProcessed(value.event, this.handlerName)):'';
                    logger.trace('message for ' + this.handlerName + ' recorded as processed ' + recordEventProcessed);
                }
            }.bind(this)).catch(function(err) {
                logger.error(this.handlerName + ' threw error ' + err);
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
                logger.error(this.handlerName + ' return this result for message ' + result.message);
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
};