/**
 * Created by rharik on 6/19/15.
 */


module.exports = function(gesEventHandlerBase) {
    return class TestEventHandler extends gesEventHandlerBase {
        constructor() {
            super();
            this.handlesEvents = ['someEventNotificationOn',
                'someEventNotificationOff',
                'someExceptionNotificationOn',
                'someExceptionNotificationOff',
                'testingEventNotificationOn',
                'testingEventNotificationOff'];
            this.eventsHandled = [];
            this.eventHandlerName = 'TestEventHandler';
        }

        someEventNotificationOn(vnt) {
           console.log('here');
            this.createNotification(vnt);
            this.eventsHandled.push(vnt);
        }

        someEventNotificationOff(vnt) {
            this.eventsHandled.push(vnt);
        }

        someExceptionNotificationOn(vnt) {
            this.createNotification(vnt);
            throw(new Error());
        }
        someExceptionNotificationOff(vnt) {
            throw(new Error());
        }

        testingEventNotificationOn(vnt){
            console.log("here");
            this.createNotification(vnt);
            this.eventsHandled.push(vnt);
        }

        testingEventNotificationOff(vnt){
            this.eventsHandled.push(vnt);
        }

        clearEventsHandled() {
            this.eventsHandled = [];
        }
    };
};