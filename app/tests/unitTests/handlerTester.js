/**
 * Created by reharik on 11/19/15.
 */
var demand = require('must');

describe('gesEventHandlerBase', function() {
    var mut;
    var _mut;
    var testHandler;
    var eventmodels;
    var uuid ;
    var JSON;
    var options = {
        logger: {
            moduleName: 'EventHandlerBase'
        },
        dagon:{

        }
    };
    var event;
    var _fantasy;
    var Future;
    var Maybe;
    var Left;
    var Right;
    var treis;
    var R;
    var continuationId;

    var container = require('../../registry_test')(options);

    beforeEach(function(){
        testHandler = container.getInstanceOf('TestEventHandler');
        eventmodels = container.getInstanceOf('eventmodels');
        _fantasy = container.getInstanceOf('_fantasy');
        R = container.getInstanceOf('R');
        treis = container.getInstanceOf('treis');
        Future = _fantasy.Future;
        Maybe = _fantasy.Maybe;
        uuid = require('uuid');
        JSON = require('JSON');

        event = {
            data            : {
                some: 'data'
            },
            continuationId  : uuid.v4(),
            originalPosition: {
                CommitPosition : 1,
                PreparePosition: 1
            },
            eventName       : 'howardTheDuck'
        };

        _mut = container.getInstanceOf('handler');
        mut = _mut(event, 'testHandler', testHandler().targetHandlerFunction)
    });

    describe('#CHECKIFPROCESSED', function() {
        context('when calling with isIdepotence equal to true', function () {
            it('should return the bool',  function () {
                mut.checkIfProcessed({isIdempotent:true})
                    .fork(x=> x.must.be.true(),
                            x=>x.must.equal(event))
            })
        });

        context('when calling with isIdepotence equal to false', function () {
            it('should return the data',  function () {
                mut.checkIfProcessed({isIdempotent:false})
                    .fork(x=> x.must.equal('item has already been processed'),
                        x=>x.must.be.true())
            })
        });

        context('when calling with isIdepotence equal to false', function () {
            it('should return the data',  function () {
                mut.checkIfProcessed()
                    .fork(x=> x.must.equal('item has already been processed'),
                        x=>x.must.be.true())
            })
        });
    });

    describe('#CHECKIDEMPOTENCY', function() {
        context('when recieving a success with idepotent is true', function () {
            it('should return functor with success value',  function () {
                event.originalPosition.checkResult = 'success';
                mut.checkIdempotency(event)
                    .fork(x=>x.must.be.true(),
                        x=> x.must.equal(event));
            })
        });

        context('when recieving a success with idepotent is failure', function () {
            it('should return functor with failure message',  function () {
                event.originalPosition.checkResult = 'failure';
                mut.checkIdempotency(event)
                    .fork(x=> x.must.equal('item has already been processed')
                ,x=> x.must.be.false());
            })
        });

        context('when recieving a failure', function () {
            it('should return functor with failure message',  function () {
                event.originalPosition.checkResult = 'error';
                mut.checkIdempotency(event)
                    .fork(x=> x.must.equal('checking idempotency resulted in an error')
                    ,x=>  x.must.be.false());
            })
        });

        context('when recieving an error', function () {
            it('should return functor with failure message',  function () {
                event.originalPosition.checkResult = '';
                mut.checkIdempotency(event)
                    .fork(x=> x.must.eql(new Error('Exception'))
                    , x =>  x.must.be.false() );
            })
        });
    });

    //describe('#HANDLEEVENT', function() {
    //    context('when recieving an event that can be processed', function () {
    //        it('should return functor with success value',  function () {
    //
    //            var _event = {
    //                data          : {
    //                    some: 'data',
    //                    path: 'success'
    //                },
    //                metadata      : {some: 'metadata'},
    //                eventName     : 'howardTheDuck',
    //                continuationId: uuid.v4()
    //            };
    //            mut.handleEvent(_event)
    //                .fork(x=> { x.must.be.true()},
    //                    x=> x.must.equal('success'));
    //        })
    //    });
    //
    //
    //    context('when recieving a failure', function () {
    //        it('should return functor with failure message',  function () {
    //            var _event = {
    //                data          : {
    //                    some: 'data',
    //                    path: 'error'
    //                },
    //                metadata      : {some: 'metadata'},
    //                eventName     : 'howardTheDuck',
    //                continuationId: uuid.v4()
    //            };
    //            mut.handleEvent(_event)
    //                .fork(x=> x.must.equal('the handler threw an error processing your request')
    //                ,x=>  x.must.be.false());
    //        })
    //    });
    //
    //    context('when recieving an error', function () {
    //        it('should return functor with failure message',  function () {
    //            var _event = {
    //                data          : {
    //                    some: 'data',
    //                    path: ''
    //                },
    //                metadata      : {some: 'metadata'},
    //                eventName     : 'howardTheDuck',
    //                continuationId: uuid.v4()
    //            };
    //            mut.handleEvent(_event)
    //                .fork(x=> x.must.eql(new Error('Exception'))
    //                , x =>  x.must.be.false() );
    //        })
    //    });
    //});

    describe('#APPLICATION', function() {
        context('when calling with success in all conditions', function () {
            it('should return functor with success value',  function () {
                event.originalPosition.checkResult = 'success';
                event.originalPosition.handlerResult = 'success';
                event.originalPosition.recordResult = 'success';
                mut.application(event)
                    .fork(x=> x.must.be.true(),
                        x=> x.must.equal('Success'));
            })
        });

        context('when recieving a failure for idenpotency', function () {
            it('should return proper failure message',  function () {
                event.originalPosition.checkResult = 'failure';
                event.originalPosition.handlerResult = 'success';
                event.originalPosition.recordResult = 'success';
                mut.application(event)
                    .fork(x=> x.must.equal('item has already been processed')
                    ,x=>  x.must.be.false());
            })
        });

        context('when recieving an error for idenpotency', function () {
            it('should return proper error message',  function () {
                event.originalPosition.checkResult = 'error';
                event.originalPosition.handlerResult = 'success';
                event.originalPosition.recordResult = 'success';
                mut.application(event)
                    .fork(x=> x.must.equal('checking idempotency resulted in an error')
                    ,x=>  x.must.be.false());
            })
        });

        context('when throwing an unexpected error during idenpotency check', function () {
            it('should return proper exception message',  function () {
                event.originalPosition.checkResult = '';
                event.originalPosition.handlerResult = 'success';
                event.originalPosition.recordResult = 'success';
                mut.application(event)
                    .fork(x=> x.must.eql(new Error('Exception'))
                    ,x=>  x.must.be.false());
            })
        });

        context('when recieving an error in event handler', function () {
            it('should return proper error message',  function () {
                event.originalPosition.checkResult = 'success';
                event.originalPosition.handlerResult = 'error';
                event.originalPosition.recordResult = 'success';
                mut.application(event)
                    .fork(x=> x.must.equal('event handler was unable to complete process')
                    ,x=>  x.must.be.false());
            })
        });

        context('when throwing an unexpected error during event handler', function () {
            it('should return proper exception message',  function () {
                event.originalPosition.checkResult = 'success';
                event.originalPosition.handlerResult = '';
                event.originalPosition.recordResult = 'success';
                mut.application(event)
                    .fork(x=> x.must.eql(new Error('Exception'))
                    ,x=>  x.must.be.false());
            })
        });

        context('when recieving an error in recording processed', function () {
            it('should return proper error message',  function () {
                event.originalPosition.checkResult = 'success';
                event.originalPosition.handlerResult = 'success';
                event.originalPosition.recordResult = 'error';
                mut.application(event)
                    .fork(x=> x.must.equal('recoding idempotence threw error processing your request')
                    ,x=>  x.must.be.false());
            })
        });

        context('when throwing an unexpected error in recording processed', function () {
            it('should return proper exception message',  function () {
                event.originalPosition.checkResult = 'success';
                event.originalPosition.handlerResult = 'success';
                event.originalPosition.recordResult = '';
                mut.application(event)
                    .fork(x=> x.must.eql(new Error('Exception'))
                    ,x=>  x.must.be.false());
            })
        });
    });

    describe('#NOTIFICATION', function() {
        context('when creating a notification', function () {
            it('should put root values on notification',  function () {
                var notification = mut.notification('success', 'success', event);
                notification.events[0].IsJson.must.not.be.empty();
                notification.events[0].EventId.must.not.be.empty();
                notification.events[0].Type.must.not.be.empty();
            });
            it('should put a buffer of the data values on notification',  function () {
                var notification = mut.notification('success', 'success', event);
                var parseData = JSON.parse(notification.events[0].Data.toString('utf8'));
                parseData.result.must.equal('success');
            });
            it('should put a buffer of the metadata values on notification',  function () {
                var notification = mut.notification('success', 'success', event);
                var parseData = JSON.parse(notification.events[0].Metadata.toString('utf8'));
                parseData.eventName.must.equal(event.eventName);
            });
        });
    });
});
