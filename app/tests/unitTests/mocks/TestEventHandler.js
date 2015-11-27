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
        var targetHandlerFunction = function(event){
                if (event.originalPosition.handlerResult) {
                    return event.originalPosition.handlerResult;
                }
            throw(new Error('Exception'));
        };

        //var targetHandlerFunction = function(event){
        //    return _fantasy.Future((rej, ret)=> {
        //        if (event.originalPosition.handlerResult == 'success') {
        //            ret(event);
        //        } else if(event.originalPosition.handlerResult== 'error'){
        //            rej('event handler was unable to complete process');
        //        } else {
        //            throw(new Error('Exception'));
        //        }
        //    });
        //};

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
