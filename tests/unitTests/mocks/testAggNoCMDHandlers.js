

module.exports = function (AggregateRootBase) {
    return class TestAggNoCMDHandlers extends AggregateRootBase {
        constructor(){
            super();
            this.eventsHandled = [];
        }
        applyEventHandlers() {
            return {
                'someEventNotificationOn': function (event) {
                    this.eventsHandled.push(event);
                }.bind(this),
                'someOtherEvent': function (event) {
                    this.eventsHandled.push(event);
                }.bind(this)
            }
        }
    };
};
