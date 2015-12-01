/**
 * Created by rharik on 6/19/15.
 */

'use strict';

module.exports = function (_fantasy) {
    return function testEventHandler() {
        var handlesEvents = ['someEventNotificationOn', 'someEventNotificationOff', 'someExceptionNotificationOn', 'someExceptionNotificationOff', 'testingEventNotificationOn', 'testingEventNotificationOff'];
        var eventsHandled = [];
        var eventHandlerName = 'TestEventHandler';

        var handleEvent = function handleEvent(vent) {
            eventsHandled.push(vent);
        };
        var targetHandlerFunction = function targetHandlerFunction(event) {
            if (event.originalPosition.handlerResult) {
                return event.originalPosition.handlerResult;
            }
            throw new Error('Exception');
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

        var clearEventsHandled = function clearEventsHandled() {
            eventsHandled = [];
        };
        var getHandledEvents = function getHandledEvents() {
            return eventsHandled;
        };
        return {
            handlesEvents: handlesEvents,
            eventHandlerName: eventHandlerName,
            handleEvent: handleEvent,
            clearEventsHandled: clearEventsHandled,
            getHandledEvents: getHandledEvents,
            eventsHandled: eventsHandled,
            targetHandlerFunction: targetHandlerFunction
        };
    };
};