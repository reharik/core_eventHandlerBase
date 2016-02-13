

module.exports = function(coqueue, eventhandlerworkflow, co) {
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
                    var fu    = yield value.handlerBase.application(value.event);
                    console.log('==========exit=========');
                    console.log('exit');
                    console.log('==========ENDexit=========');
                    console.log(fu);
                }
            }).catch(function(err) {
                console.log('==========err=========');
                console.log(err);
                console.log('==========ENDerr=========');
            });
        }

        handleEvent(event) {
            var handlerBase = eventhandlerworkflow(this.handlerName, this.handlers[event.eventName]);
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