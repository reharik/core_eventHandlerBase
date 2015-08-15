/**
 * Created by rharik on 6/19/15.
 */


module.exports = function(gesEventHandlerBase) {
    return class NotificationHandler extends gesEventHandlerBase {
        constructor() {
            super();
            this.handlesEvents = ['notificationEvent'];
            this.eventsHandled = [];
            this.eventHandlerName = 'NotificationHandler';
        }

        notificationEvent(vnt) {
            this.eventsHandled.push(vnt);
        }

        clearEventsHandled() {
            this.eventsHandled = [];
        }
    };
};