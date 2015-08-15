///**
// * Created by rharik on 6/19/15.
// */
//
var demand = require('must');
var _ = require('lodash');

describe('gesEventHandlerBase', function() {
    var mut;
    var TestHandler;
    var GesEvent;
    var uuid;
    var expectIdempotence;
    var container;
    var JSON;

    before(function(){
        container = require('../testBootstrap');
        var gesConnection = container.getInstanceOf('gesConnection');
        if(_.isFunction(gesConnection.openConnection)) {
            container.inject({name: 'gesConnection', resolvedInstance: gesConnection.openConnection()});
            gesConnection = container.getInstanceOf('gesConnection');
        }
        TestHandler = container.getInstanceOf('TestEventHandler');
        GesEvent = container.getInstanceOf('GesEvent');
        uuid = container.getInstanceOf('uuid');
        expectIdempotence = require('./mocks/expectIdempotenceMock')();
        JSON = container.getInstanceOf('JSON');
        mut = new TestHandler();
    });
    beforeEach(function(){
        mut.clearEventsHandled();
    });

    describe('#handle event', function() {
        context('when calling handler and not passing idempotency', function () {
            it('should not process event',  function () {
                mut.handleEvent({'some':'event'});
                mut.eventsHandled.length.must.equal(0);
            })
        });
        context('when calling handler that throws an exception', function () {
            it('should not process event', async function () {
                TestHandler = container.getInstanceOf('TestEventHandler');
                mut = new TestHandler();

                var eventData =new GesEvent('someExceptionNotificationOff',{'some':'data'},{eventTypeName:'someExceptionNotificationOff'});
                var result = await mut.handleEvent(eventData);
                mut.eventsHandled.length.must.equal(0);
            })
        });

        context('when calling handler that throws an exception and notification on', function () {
            it('should send proper notification event', async function () {
                var ges;
                var gesConnection = container.getInstanceOf('gesConnection');
                if(_.isFunction(gesConnection.openConnection)) {
                    ges = {name: 'gesConnection', resolvedInstance: gesConnection.openConnection()};
                    container.inject([{name:'expectIdempotence', resolvedInstance:expectIdempotence(true)},ges]);
                }else {
                    container.inject([{name: 'expectIdempotence', resolvedInstance: expectIdempotence(true)}]);
                }
                TestHandler = container.getInstanceOf('TestEventHandler');
                mut = new TestHandler();

                var eventData =new GesEvent('someExceptionNotificationOn',{'some':'data'},{eventTypeName:'someExceptionNotificationOn'});
                var result = await mut.handleEvent(eventData);
                JSON.parse(result.data.events[0].Data).notificationType.must.equal('Failure');
            })
        });

        context('when calling handler that throws an exception and notification OFF', function () {
            it('should not send notification event', async function () {
                TestHandler = container.getInstanceOf('TestEventHandler');
                mut = new TestHandler();

                var eventData =new GesEvent('someExceptionNotificationOff',{'some':'data'},{eventTypeName:'someExceptionNotificationOff'});
                var result = await mut.handleEvent(eventData);
                demand(result).be.undefind;
            })
        });


        context('when calling handler that DOES NOT throw an exception and notification ON', function () {
            it('should send proper notification event', async function () {
                TestHandler = container.getInstanceOf('TestEventHandler');
                mut = new TestHandler();

                var eventData =new GesEvent('someEventNotificationOn',{'some':'data'},{eventTypeName:'someEventNotificationOn'});
                var result = await mut.handleEvent(eventData);
                JSON.parse(result.data.events[0].Data).notificationType.must.equal('Success');
            })
        });

        context('when calling handler that DOES NOT throw an exception and notification OFF', function () {
            it('should send proper notification event', async function () {
                TestHandler = container.getInstanceOf('TestEventHandler');
                mut = new TestHandler();

                var eventData =new GesEvent('someEventNotificationOff',{'some':'data'},{eventTypeName:'someEventNotificationOff'});
                var result = await mut.handleEvent(eventData);
                demand(result).be.undefind;

            })
        });

        context('when calling handler that DOES NOT throws an exception', function () {
            it('should process event', async function () {
                var eventData =new GesEvent('someEventNotificationOff',{'some':'data'},{eventTypeName:'someEventNotificationOff'});
                TestHandler = container.getInstanceOf('TestEventHandler');
                mut = new TestHandler();

                var result = await mut.handleEvent(eventData);
                mut.eventsHandled.length.must.equal(1);
            });
        });
        context('when calling handler is successful', function () {
            it('should have proper properties on notification event', async function () {
                TestHandler = container.getInstanceOf('TestEventHandler');
                mut = new TestHandler();
                var continuationId = uuid.v1();
                var eventData =new GesEvent('someEventNotificationOn',{'some':'data'},{eventTypeName:'someEventNotificationOn', continuationId:continuationId});
                var result = await mut.handleEvent(eventData);

                result.data.expectedVersion.must.equal(-2);
                result.data.events[0].EventId.length.must.equal(36);
                result.data.events[0].Type.must.equal('notificationEvent');
                JSON.parse(result.data.events[0].Metadata).eventTypeName.must.equal('notificationEvent');
                JSON.parse(result.data.events[0].Data).initialEvent.eventTypeName.must.equal('someEventNotificationOn');
                JSON.parse(result.data.events[0].Metadata).continuationId.must.equal(continuationId);
            })
        });
    });
});