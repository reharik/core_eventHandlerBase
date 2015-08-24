///**
// * Created by rharik on 6/19/15.
// */
//
var demand = require('must');

describe('gesEventHandlerBase', function() {
    var mut;
    var TestHandler;
    var gesEvent;
    var uuid;
    var expectIdempotence;
    var container;
    var JSON;

    before(function(){
        TestHandler = require('./mocks/TestEventHandler');
        gesEvent = require('eventmodels')().gesEvent;
        uuid = require('uuid');
        JSON = require('JSON');
        var eventStore = require('eventstore')({unitTest:true});
        var readStore = require('readstorerepository')({unitTest:true});
        var base = require('../../src/index')(eventStore, readStore);
        var _mut = TestHandler(base);
        mut = new _mut();
    });
    beforeEach(function(){
        console.log(mut);
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

                var eventData = gesEvent.init('someExceptionNotificationOff',{'some':'data'},{eventTypeName:'someExceptionNotificationOff'});
                var result = await mut.handleEvent(eventData);
                mut.eventsHandled.length.must.equal(0);
            })
        });

        context('when calling handler that throws an exception and notification on', function () {
            it('should send proper notification event', async function () {

                var eventData =gesEvent.init('someExceptionNotificationOn',{'some':'data'},{eventTypeName:'someExceptionNotificationOn'});
                var result = await mut.handleEvent(eventData);
                console.log("resultxxxxxxxxxxxxx");
                console.log(result);
                JSON.parse(result.events[0].Data).result.must.equal('Failure');
            })
        });

        context('when calling handler that throws an exception and notification OFF', function () {
            it('should not send notification event', async function () {

                var eventData =gesEvent.init('someExceptionNotificationOff',{'some':'data'},{eventTypeName:'someExceptionNotificationOff'});
                var result = await mut.handleEvent(eventData);
                demand(result).be.undefind;
            })
        });


        context('when calling handler that DOES NOT throw an exception and notification ON', function () {
            it('should send proper notification event', async function () {

                var eventData =gesEvent.init('someEventNotificationOn',{'some':'data'},{eventTypeName:'someEventNotificationOn'});
                var result = await mut.handleEvent(eventData);
                JSON.parse(result.events[0].Data).result.must.equal('Success');
            })
        });

        context('when calling handler that DOES NOT throw an exception and notification OFF', function () {
            it('should send proper notification event', async function () {

                var eventData =gesEvent.init('someEventNotificationOff',{'some':'data'},{eventTypeName:'someEventNotificationOff'});
                var result = await mut.handleEvent(eventData);
                demand(result).be.undefind;

            })
        });

        context('when calling handler that DOES NOT throws an exception', function () {
            it('should process event', async function () {
                var eventData = gesEvent.init('someEventNotificationOff',{'some':'data'},{eventTypeName:'someEventNotificationOff'});
                var result = await mut.handleEvent(eventData);
                mut.eventsHandled.length.must.equal(1);
            });
        });
        context('when calling handler is successful', function () {
            it('should have proper properties on notification event', async function () {
                var continuationId = uuid.v1();
                var eventData =gesEvent.init('someEventNotificationOn',{'some':'data'},{eventTypeName:'someEventNotificationOn', continuationId:continuationId});
                var result = await mut.handleEvent(eventData);
                result.expectedVersion.must.equal(-2);
                result.events[0].EventId.length.must.equal(36);
                result.events[0].Type.must.equal('notification');
                JSON.parse(result.events[0].Metadata).eventName.must.equal('notification');
                JSON.parse(result.events[0].Data).initialEvent.eventName.must.equal('someEventNotificationOn');
                JSON.parse(result.events[0].Metadata).continuationId.must.equal(continuationId);
            })
        });
    });
});