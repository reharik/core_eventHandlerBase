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
    var Either;
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
        Either = _fantasy.Either;
        Left =_fantasy.Either.Left;
        Right =_fantasy.Either.Right;
        uuid = require('uuid');
        JSON = require('JSON');

        event = {
            eventName:'howardTheDuck',
            continuationId:uuid.v4(),
            data: {some:'data'}
        };

        _mut = container.getInstanceOf('handler');
    });

    beforeEach(function(){
        mut = _mut(event,testHandler().targetHandlerFunction)
    });

    describe('#CHECKIFPROCESSED', function() {
        context('when calling with isIdepotence equal to true', function () {
            it('should return the data',  function () {
                mut.checkIfProcessed({isIdempotent:true})
                    .fork(x=> x.must.be.true(),
                            x=>x.isIdempotent.must.be.true())
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
                var input = {
                    handle: {path: 'success'},
                    check : {path: 'success'},
                    record: {path: 'success'},
                    dispatch: {path: 'success'}
                };
                mut.checkIdempotency(input)
                    .fork(x=> x.must.be.true(),
                        x=> x.isIdempotent.must.be.true());
            })
        });

        context('when recieving a success with idepotent is failure', function () {
            it('should return functor with failure message',  function () {
                var input = {
                    check : {path: 'failure'}
                };
                mut.checkIdempotency(input)
                    .fork(x=> x.must.equal('item has already been processed')
                ,x=> x.must.be.false());
            })
        });

        context('when recieving a failure', function () {
            it('should return functor with failure message',  function () {
                var input = {
                    check : {path: 'error'}
                };
                mut.checkIdempotency(input)
                    .fork(x=> x.must.equal('there was an error processing your request')
                    ,x=>  x.must.be.false());
            })
        });

        context('when recieving an error', function () {
            it('should return functor with failure message',  function () {
                var input = {
                    check : {path: ''}
                };
                mut.checkIdempotency(input)
                    .fork(x=> x.must.eql(new Error('Exception'))
                    , x =>  x.must.be.false() );
            })
        });
    });

    describe('#HANDLEEVENT', function() {
        context('when recieving a success with idepotent is true', function () {
            it('should return functor with success value',  function () {
                var input = {
                    handle: {path: 'success'},
                    check : {path: 'success'},
                    record: {path: 'success'},
                    dispatch: {path: 'success'}
                };
                mut.handleEvent(input)
                    .fork(x=> x.must.be.true(),
                        x=> x.isIdempotent.must.be.true());
            })
        });

        context('when recieving a failure', function () {
            it('should return functor with failure message',  function () {
                var input = {
                    handle: {path: 'error'},
                    check : {path: 'success'},
                    record: {path: 'success'},
                    dispatch: {path: 'success'}
                };
                mut.handleEvent(input)
                    .fork(x=> x.must.equal('the handler threw an error processing your request')
                    ,x=>  x.must.be.false());
            })
        });

        context('when recieving an error', function () {
            it('should return functor with failure message',  function () {
                var input = {
                    handle: '',
                    check : {path: 'success'},
                    record: {path: 'success'},
                    dispatch: {path: 'success'}
                };
                mut.handleEvent(input)
                    .fork(x=> x.must.eql(new Error('Exception'))
                    , x =>  x.must.be.false() );
            })
        });
    });

    describe('#RECORDEVENT', function() {
        context('when recieving a success with idepotent is true', function () {
            it('should return functor with success value',  function () {
                var input = {
                    handle: {path: 'success'},
                    check : {path: 'success'},
                    record: {path: 'success'},
                    dispatch: {path: 'success'}
                };
                mut.recordEvent(input)
                    .fork(x=> x.must.be.true(),
                        x=> x.eventName.must.equal('howardTheDuck'));
            })
        });

        context('when recieving a failure', function () {
            it('should return functor with failure message',  function () {
                var input = {
                    handle: {path: 'success'},
                    check : {path: 'success'},
                    record: {path: 'error'},
                    dispatch: {path: 'success'}
                };
                mut.recordEvent(input)
                    .fork(x=> x.must.equal('recoding idempotence threw error processing your request')
                    ,x=>  x.must.be.false());
            })
        });

        context('when recieving an error', function () {
            it('should return functor with failure message',  function () {
                var input = {
                    handle: {path: 'success'},
                    check : {path: 'success'},
                    record: '',
                    dispatch: {path: 'success'}
                };
                mut.recordEvent(input)
                    .fork(x=> x.must.eql(new Error('Exception'))
                    , x =>  x.must.be.false() );
            })
        });
    });

    describe('#NOTIFICATION', function() {
        context('when creating a notification', function () {
            it('should put root values on notification',  function () {
                var notification = mut.notification('success', 'success', event);
                notification.IsJson.must.not.be.empty();
                notification.EventId.must.not.be.empty();
                notification.Type.must.not.be.empty();
            })
        });
    });

});
