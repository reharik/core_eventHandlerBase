//var bs = require('../../bootstrap');


module.exports = function (AggregateRootBase, GesEvent) {
    return class TestAgg extends AggregateRootBase {
        constructor() {
            super();
            this.eventsHandled = [];
            this.type = 'TestAgg';
        }

        getEventsHandled() {
            return this.eventsHandled
        }

        clearEventsHandled() {
            return this.eventsHandled = []
        }

        static aggregateName() {
            return 'TestAgg';
        }

        commandHandlers() {
            return {
                'someCommand': function (command) {
                    var vent1 = new GesEvent('someAggEvent', {blah: command.value}, {someMetadata:'1234'});
                    this.raiseEvent(vent1);
                },
                'someOtherCommand': function (command) {
                    var vent2 = new GesEvent('someOtherAggEvent', {blah: command.value}, {someOtherMetadata:'1234'});
                    this.raiseEvent(vent2);
                }
            }
        }

        applyEventHandlers() {
            return {
                'someAggEvent': function (event) {
                    console.log("HERE");
                    this.eventsHandled.push(event);
                }.bind(this),
                'someOtherAggEvent': function (event) {
                    this.eventsHandled.push(event);
                }.bind(this)
            }
        }
    }
};