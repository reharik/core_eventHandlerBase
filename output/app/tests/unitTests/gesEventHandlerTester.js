///**
// * Created by rharik on 6/19/15.
// */
//
'use strict';

var demand = require('must');

describe('gesEventHandlerBase', function () {
    var mut;
    var TestHandler;
    var eventmodels;
    var uuid;
    var JSON;
    var options = {
        logger: {
            moduleName: 'EventHandlerBase'
        },
        dagon: {}
    };
    var container = require('../../registry_test')(options);
    before(function () {
        TestHandler = container.getInstanceOf('TestEventHandler');
        eventmodels = container.getInstanceOf('eventmodels');
        uuid = require('uuid');
        JSON = require('JSON');
        mut = new TestHandler();
    });

    beforeEach(function () {
        mut.clearEventsHandled();
    });

    describe('#handle event', function () {
        context('when calling handler and not passing idempotency', function () {
            it('should not process event', function () {
                mut.handleEvent({ 'some': 'event' });
                mut.eventsHandled.length.must.equal(0);
            });
        });

        context('when calling handler that throws an exception', function () {
            it('should not process event', function callee$3$0() {
                var eventData, result;
                return regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                    while (1) switch (context$4$0.prev = context$4$0.next) {
                        case 0:
                            eventData = eventmodels.gesEvent('someExceptionNotificationOff', { 'some': 'data' }, { eventTypeName: 'someExceptionNotificationOff' });
                            context$4$0.next = 3;
                            return regeneratorRuntime.awrap(mut.handleEvent(eventData));

                        case 3:
                            result = context$4$0.sent;

                            mut.eventsHandled.length.must.equal(0);

                        case 5:
                        case 'end':
                            return context$4$0.stop();
                    }
                }, null, this);
            });
        });

        context('when calling handler that throws an exception and notification on', function () {
            it('should send proper notification event', function callee$3$0() {
                var eventData, result;
                return regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                    while (1) switch (context$4$0.prev = context$4$0.next) {
                        case 0:
                            eventData = eventmodels.gesEvent('someExceptionNotificationOn', { 'some': 'data' }, { eventTypeName: 'someExceptionNotificationOn' });
                            context$4$0.next = 3;
                            return regeneratorRuntime.awrap(mut.handleEvent(eventData));

                        case 3:
                            result = context$4$0.sent;

                            JSON.parse(result.events[0].Data).result.must.equal('Failure');

                        case 5:
                        case 'end':
                            return context$4$0.stop();
                    }
                }, null, this);
            });
        });

        context('when calling handler that DOES NOT throw an exception and notification ON', function () {
            it('should send proper notification event', function callee$3$0() {
                var eventData, result;
                return regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                    while (1) switch (context$4$0.prev = context$4$0.next) {
                        case 0:
                            eventData = eventmodels.gesEvent('someEventNotificationOn', { 'some': 'data' }, { eventTypeName: 'someEventNotificationOn' });
                            context$4$0.next = 3;
                            return regeneratorRuntime.awrap(mut.handleEvent(eventData));

                        case 3:
                            result = context$4$0.sent;

                            JSON.parse(result.events[0].Data).result.must.equal('Success');

                        case 5:
                        case 'end':
                            return context$4$0.stop();
                    }
                }, null, this);
            });
        });

        context('when calling handler that DOES NOT throws an exception', function () {
            it('should process event', function callee$3$0() {
                var eventData, result;
                return regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                    while (1) switch (context$4$0.prev = context$4$0.next) {
                        case 0:
                            eventData = eventmodels.gesEvent('someEventNotificationOff', { 'some': 'data' }, { eventTypeName: 'someEventNotificationOff' });
                            context$4$0.next = 3;
                            return regeneratorRuntime.awrap(mut.handleEvent(eventData));

                        case 3:
                            result = context$4$0.sent;

                            mut.eventsHandled.length.must.equal(1);

                        case 5:
                        case 'end':
                            return context$4$0.stop();
                    }
                }, null, this);
            });
        });
        context('when calling handler is successful', function () {
            it('should have proper properties on notification event', function callee$3$0() {
                var continuationId, eventData, result;
                return regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                    while (1) switch (context$4$0.prev = context$4$0.next) {
                        case 0:
                            continuationId = uuid.v1();
                            eventData = eventmodels.gesEvent('someEventNotificationOn', { 'some': 'data' }, { eventTypeName: 'someEventNotificationOn', continuationId: continuationId });
                            context$4$0.next = 4;
                            return regeneratorRuntime.awrap(mut.handleEvent(eventData));

                        case 4:
                            result = context$4$0.sent;

                            result.expectedVersion.must.equal(-2);
                            result.events[0].EventId.length.must.equal(36);
                            result.events[0].Type.must.equal('notification');
                            JSON.parse(result.events[0].Metadata).eventName.must.equal('notification');
                            JSON.parse(result.events[0].Data).initialEvent.eventName.must.equal('someEventNotificationOn');
                            JSON.parse(result.events[0].Metadata).continuationId.must.equal(continuationId);

                        case 11:
                        case 'end':
                            return context$4$0.stop();
                    }
                }, null, this);
            });
        });
    });
});