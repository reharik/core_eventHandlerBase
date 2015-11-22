/**
 * Created by rharik on 6/19/15.
 */

module.exports = function(_fantasy) {
    return function testEventHandler() {
        var handlesEvents    = [
            'someEventNotificationOn',
            'someEventNotificationOff',
            'someExceptionNotificationOn',
            'someExceptionNotificationOff',
            'testingEventNotificationOn',
            'testingEventNotificationOff'
        ];
        var eventsHandled    = [];
        var eventHandlerName = 'TestEventHandler';

        var handleEvent        = function(vent) {
            eventsHandled.push(vent);
        };
        var targetHandlerFunction = function(event, isIdempotent){
            return _fantasy.Future((rej, ret)=> {
                if (isIdempotent.handle.path == 'success') {
                    ret({
                        isIdempotent: true,
                        isNewStream : true,
                        record:{path:isIdempotent.record.path},
                        dispatch:{path:isIdempotent.dispatch.path}
                    });
                } else if(isIdempotent.handle.path=='error'){
                    rej('the handler threw an error processing your request');
                } else {
                    throw(new Error('Exception'));
                }
            });
        };
        var clearEventsHandled = function() {
            eventsHandled = [];
        };
        var getHandledEvents   = function() {
            return eventsHandled;
        };
        return {
            handlesEvents,
            eventHandlerName,
            handleEvent,
            clearEventsHandled,
            getHandledEvents,
            eventsHandled,
            targetHandlerFunction
        }

    };
};
