/**
 * Created by rharik on 6/19/15.
 */

require('must');
var _ = require('lodash');

describe('gesDispatcher', function() {
    var container;
    var GesEvent;
    var gesConnection;
    var mod;
    var mut;
    var TestHandler;
    var testHandler;
    var JSON;

    before(function(){
        container = require('../testBootstrap');
        console.log(container);
        GesEvent = container.getInstanceOf('GesEvent');
        gesConnection = container.getInstanceOf('gesConnection');
        if(_.isFunction(gesConnection.openConnection)) {
            container.inject({name: 'gesConnection', resolvedInstance: gesConnection.openConnection()});
            gesConnection = container.getInstanceOf('gesConnection');
        }
        mod = container.getInstanceOf('gesDispatcher');
        TestHandler = container.getInstanceOf('TestEventHandler');
        testHandler = new TestHandler();
        JSON = container.getInstanceOf('JSON');
        mut = new mod({handlers:[testHandler]});

    });
    beforeEach(function(){
       testHandler.clearEventsHandled();
        gesConnection.clean();
    });


    describe('#Instanciate Dispatcher', function() {
        context('when instanciating dispatcher with no handlers', function () {
            it('should throw proper error',  function () {
                (function(){new mod()}).must.throw(Error,"Invariant Violation: Dispatcher requires at least one handler");
            })
        });
        context('when instanciating dispatcher with custom options', function () {
            it('should have overwrite defaults',  function () {
                var opts = {
                    stream: 'someEventStream',
                    targetTypeName: 'CommandTypeName',
                    eventTypeName: 'command',
                    handlers:[new TestHandler() ]
                };
                var littleD = new mod(opts);
                littleD.options.stream.must.equal(opts.stream);
                littleD.options.targetTypeName.must.equal(opts.targetTypeName);
                littleD.options.eventTypeName.must.equal(opts.eventTypeName);
            })
        });
    });
    describe('#StartDispatching', function() {
        context('when calling StartDispatching', function () {
            it('should handle event',  function () {
                mut.startDispatching();

                var subscription = gesConnection.getSubscription();
                var eventData = {
                    Event:{EventType:'someEventNotificationOn'},
                    OriginalPosition:{},
                    OriginalEvent:{
                        Metadata:{eventTypeName:'eventTypeName'},
                        Data:{'some':'data'}
                    }

                };
                subscription.emit('event', eventData);
                testHandler.eventsHandled.length.must.equal(1);
            });

            it('should should emit the proper type',  function () {
                mut.startDispatching();
                var subscription = gesConnection.getSubscription();
                var eventData = {
                    Event:{EventType:'someEventNotificationOn'},
                    OriginalPosition:'the originalPosition',
                    OriginalEvent:{
                        Metadata:{eventTypeName:'someEventNotificationOn'},
                        Data:{'some':'data'}
                    }

                };
                subscription.emit('event', eventData);
                testHandler.eventsHandled[0].must.be.instanceof(GesEvent) ;
            });

            it('should all the expected values on it',  function () {
                mut.startDispatching();
                var subscription = gesConnection.getSubscription();
                var eventData = {
                    Event:{EventType:'someEventNotificationOn'},
                    OriginalPosition:'the originalPosition',
                    OriginalEvent:{
                        Metadata:{eventTypeName:'someEventNotificationOn'},
                        Data:{'some':'data'}
                    }

                };
                subscription.emit('event', eventData);
                var eventsHandled = testHandler.eventsHandled[0];
                eventsHandled.eventTypeName.must.equal('someEventNotificationOn');
                eventsHandled.originalPosition.must.equal('the originalPosition');
                eventsHandled.metadata.eventTypeName.must.equal('someEventNotificationOn');
                eventsHandled.data.some.must.equal('data');
            })
        });

        context('when calling StartDispatching with filter breaking vars', function () {
            it('should not post event to handler for system event',  function () {
                mut.startDispatching();
                var subscription = gesConnection.getSubscription();
                var eventData = {
                    Event:{EventType:'$testEvent'},
                    OriginalPosition:{},
                    OriginalEvent:{
                        Metadata:{eventTypeName:'someEventNotificationOn'},
                        Data:{'some':'data'}
                    }

                };
                subscription.emit('event', eventData);
                testHandler.eventsHandled.length.must.equal(0);
            });
            it('should not post event to handler for empty metadata',  function () {
                mut.startDispatching();
                var subscription = gesConnection.subscribeToStream();
                var eventData = {
                    Event:{EventType:'testEvent'},
                    OriginalPosition:{},
                    OriginalEvent:{
                        Metadata:{},
                        Data:{'some':'data'}
                    }

                };
                subscription.emit('event', eventData);
                testHandler.eventsHandled.length.must.equal(0);
            });
            it('should not post event to handler for empty data',  function () {
                mut.startDispatching();
                var subscription = gesConnection.subscribeToStream();
                var eventData = {
                    Event:{EventType:'testEvent'},
                    OriginalPosition:{},
                    OriginalEvent:{
                        Metadata:{eventTypeName:'someEventNotificationOn'},
                        Data:{}
                    }

                };
                subscription.emit('event', eventData);
                testHandler.eventsHandled.length.must.equal(0);
            });

            it('should not break when empty metadata or data',  function () {
                mut.startDispatching();
                var subscription = gesConnection.subscribeToStream();
                var eventData = {
                    Event:{Type:'testEvent'},
                    OriginalPosition:{},
                    OriginalEvent:{}
                };
                subscription.emit('event', eventData);
                testHandler.eventsHandled.length.must.equal(0);
            });
        });

    });


});
