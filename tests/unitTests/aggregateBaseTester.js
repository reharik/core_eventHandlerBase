

require('must');
var container;
var testAgg;
var testAggNoCMDHandlers;
var testAggNoEventHandlers;
var JSON;

describe('aggregateFunctionality', function() {
    var mut;

    before(function(){
        container = require('../testBootstrap');
        JSON = container.getInstanceOf('JSON');
        testAgg = container.getInstanceOf('testAgg');
        testAggNoCMDHandlers = container.getInstanceOf('testAggNoCMDHandlers');
        testAggNoEventHandlers = container.getInstanceOf('testAggNoEventHandlers');
    });

    beforeEach(function(){
        mut = new testAgg();
    });

    describe('#aggConstructor', function(){
        context('when newing up agg without any command handlers', function () {
            it('should throw proper error', function () {
                (function(){new testAggNoCMDHandlers()}).must.throw(Error,'Invariant Violation: An aggregateRoot requires commandHandlers');
            })
        });

        context('when newing up agg without any event handlers', function (){
            it('should throw proper error', function () {
                (function(){new testAggNoEventHandlers()}).must.throw('Invariant Violation: An aggregateRoot requires applyEventHandlers');
            })
        });
    });

    describe('#CommandHandlers', function(){
        context('when newing up agg',function (){
            it('should make commandhandlers available at root', function () {
                (mut.someCommand instanceof Function).must.be.true();
                (mut.someOtherCommand instanceof Function).must.be.true();
            })
        });

        context('when calling a commandHandler', function () {
            it('should emit an event to the uncommited event collection and getuncommitedevents should work', function () {
                mut.someCommand({'commandName':'someEventNotificationOff', 'value':'some value'});
                mut.getUncommittedEvents()[0].data.blah.must.equal('some value');
            })
        });

        context('when calling a clearUncommitedEvents', function () {
            it('should clear events', function () {
                mut.someCommand({'commandName':'someEventNotificationOff', 'value':'some value'});
                mut.clearUncommittedEvents();
                mut.getUncommittedEvents().must.be.empty();
            })
        });
    });

});