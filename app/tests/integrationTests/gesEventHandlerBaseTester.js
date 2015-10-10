/**
 * Created by rharik on 7/6/15.
 */
var demand = require('must');


describe('gesEventHandlerBaseTester', function() {
    var bootstrap;
    var Mut;
    var mut;
    var uuid;
    var EventData;
    var appendData;
    var TestEventHandler;
    var testEventHandler;
    var NotificationHandler;
    var notificationHandler;
    var append;
    var continuationId;

    before( function () {
        bootstrap = require('../intTestBootstrap');

    });

    beforeEach(function () {
        Mut = bootstrap.getInstanceOf('gesDispatcher');
        NotificationHandler = bootstrap.getInstanceOf('NotificationHandler');
        TestEventHandler = bootstrap.getInstanceOf('TestEventHandler');
        uuid = bootstrap.getInstanceOf('uuid');
        EventData = bootstrap.getInstanceOf('EventData');
        append = bootstrap.getInstanceOf('appendToStreamPromise');

        continuationId=uuid.v4();
        testEventHandler = new TestEventHandler();
        notificationHandler = new NotificationHandler();
        mut = new Mut({handlers:[notificationHandler,testEventHandler]});
        mut.startDispatching();

    });

    context('when calling gesDispatcher with success', ()=> {
        it('should submit proper notification event', (done)=> {
            appendData = { expectedVersion: -2 };
            appendData.events = [new EventData('testingEventNotificationOn', {data:'somedata'},{eventTypeName:'testingEventNotificationOn', continuationId:continuationId})];
            append('dispatchStream',appendData);

            setTimeout(()=>{
                notificationHandler.eventsHandled.length.must.be.at.least(1);
                demand(notificationHandler.eventsHandled.find(x=>x.eventTypeName != 'notificationEvent')).be.undefined();
                notificationHandler.eventsHandled.filter(x=>x.metadata.continuationId == continuationId).length.must.be.at.least(1);
                notificationHandler.eventsHandled.filter(x=>x.metadata.continuationId == continuationId)[0].data.notificationType.must.equal('Success');

                done();
            }, 1500);

        });
    });

    context('when calling gesDispatcher with failure', ()=> {
        it('should submit proper notification event', (done) => {
            appendData = { expectedVersion: -2, some:'data' };
            appendData.events = [new EventData('someExceptionNotificationOn', appendData,{eventTypeName:'someExceptionNotificationOn', continuationId:continuationId})];
            append('dispatchStream',appendData);

            setTimeout(()=>{
                notificationHandler.eventsHandled.length.must.be.at.least(1);
                demand(notificationHandler.eventsHandled.find(x=>x.eventTypeName != 'notificationEvent')).be.undefined();
                notificationHandler.eventsHandled.filter(x=>x.metadata.continuationId == continuationId).length.must.be.at.least(1);
                notificationHandler.eventsHandled.filter(x=>x.metadata.continuationId == continuationId)[0].data.notificationType.must.equal('Failure');
                done();
            }, 1500);
        });
    });
});
