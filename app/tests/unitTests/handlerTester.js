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
        _mut = container.getInstanceOf('handler');
    });

    beforeEach(function(){
        mut = _mut(event,testHandler)
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
                mut.checkIdempotency('success')
                    .fork(x=> x.must.be.true(),
                        x=> x.isIdempotent.must.be.true());
            })
        });

        context('when recieving a success with idepotent is failure', function () {
            it('should return functor with failure message',  function () {
                mut.checkIdempotency('failure')
                    .fork(x=> x.must.equal('item has already been processed')
                ,x=> x.must.be.false());
            })
        });

        context('when recieving a failure', function () {
            it('should return functor with failure message',  function () {
                mut.checkIdempotency('error')
                    .fork(x=> x.must.equal('there was an error processing your request')
                    ,x=>  x.must.be.false());
            })
        });

        context('when recieving an error', function () {
            it('should return functor with failure message',  function () {
                mut.checkIdempotency()
                    .fork(x=> x.must.eql(new Error('Exception'))
                    ,x=>  x.must.be.false());
            })
        });
    });



});
