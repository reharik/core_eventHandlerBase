/**
 * Created by rharik on 6/10/15.
 */

require('must');
var _ = require('lodash');

var container;

describe('getEventStoreRepository', function() {
    var mut;
    var TestAgg;
    var BadAgg = function(){};
    var badAgg = new BadAgg();
    var testAgg;
    var uuid;
    var gesConnection;
    var streamNameStrategy;
    var GesEvent;
    var JSON;

    before(function(){
        container = require('../testBootstrap');
        streamNameStrategy = container.getInstanceOf('streamNameStrategy');
        gesConnection = container.getInstanceOf('gesConnection');
        if(gesConnection &&_.isFunction(gesConnection.openConnection)) {
            container.inject({name: 'gesConnection', resolvedInstance: gesConnection.openConnection()});

            gesConnection = container.getInstanceOf('gesConnection');
        }


        uuid = container.getInstanceOf('uuid');
        TestAgg = container.getInstanceOf('testAgg');
        GesEvent = container.getInstanceOf('GesEvent');
        JSON = container.getInstanceOf('JSON');
        mut = container.getInstanceOf('gesRepository')();
    });

    describe('#getById', function() {
        context('when calling get by id with bad aggtype', function () {
            it('should throw proper error', function () {
                mut.getById(BadAgg, uuid.v1(), '').must.reject.error(Error,"Invariant Violation: aggregateType must inherit from AggregateBase");
            })
        });
        context('when calling getById with bad uuid', function () {
            it('should throw proper error', function () {
                mut.getById(TestAgg,'some non uuid','').must.reject.error(Error,"Invariant Violation: id must be a valid uuid");
            })
        });
        context('when calling getById with bad version', function (){
            it('should throw proper error', function () {
                mut.getById(TestAgg,uuid.v1(),-6).must.reject.error(Error, "Invariant Violation: version number must be greater than or equal to 0");

            })
        });
        context('when calling getById with proper args',function (){
            it('should return proper agg', async function () {
                var data = JSON.stringify(new GesEvent('someAggEvent',null,{blah:'blah'}));
                var result = {
                    Status: 'OK',
                    NextEventNumber:3,
                    Events: [{OriginalEvent:{EventType:'someAggEvent',Data: data, Metadata: {eventTypeName:'someEventNotificationOn'}}},
                        {OriginalEvent:{EventType:'someAggEvent',Data: data, Metadata: {eventTypeName:'someEventNotificationOn'}}},
                        {OriginalEvent:{EventType:'someAggEvent',Data: data, Metadata: {eventTypeName:'someEventNotificationOn'}}}],
                    IsEndOfStream: false
                };
                gesConnection.readStreamEventForwardShouldReturnResult(result);
                var results = await mut.getById(TestAgg,uuid.v1(),0);
                results.must.be.instanceof(TestAgg);
            })
        });
        context('when calling getById with multiple events returned',function (){
            it('should return apply all events and presumably loop', async function () {
                var result = {
                    Status: 'OK',
                    NextEventNumber:3,
                    Events: [{OriginalEvent:{EventType:'someAggEvent', Metadata: {eventTypeName:'someAggEvent'}}},
                        {OriginalEvent:{EventType:'someAggEvent', Metadata: {eventTypeName:'someAggEvent'}}},
                        {OriginalEvent:{EventType:'someAggEvent', Metadata: {eventTypeName:'someAggEvent'}}}],
                    IsEndOfStream: false
                };
                gesConnection.readStreamEventForwardShouldReturnResult(result);
                var agg = await mut.getById(TestAgg,uuid.v1(),0);
                agg.getEventsHandled().length.must.equal(3);
            })
        });

        context('when calling getById with multiple events returned',function (){
            it('should set the agg version properly', async function () {
                var byId = await mut.getById(TestAgg, uuid.v1(), 0);
                byId._version.must.equal(3);
            })
        });

        context('when calling getById with proper args but stream deleted', function (){
            it('should throw proper error', function () {
                var data = JSON.stringify(new GesEvent('someEventNotificationOn',null,{blah:'blah'}));
                var result = {
                    Status: 'StreamDeleted',
                    NextEventNumber:3,
                    Events: [{Event:{EventType:'someAggEvent',Data: data, OriginalEvent: {Metadata: {eventTypeName:'someEventNotificationOn'}}}},
                        {Event:{EventType:'someAggEvent',Data: data, OriginalEvent: {Metadata: {eventTypeName:'someEventNotificationOn'}}}},
                        {Event:{EventType:'someAggEvent',Data: data, OriginalEvent: {Metadata: {eventTypeName:'someEventNotificationOn'}}}}],
                    IsEndOfStream: false
                };
                var id = uuid.v1();
                var streamName = streamNameStrategy(TestAgg.aggregateName(),id);
                gesConnection.readStreamEventForwardShouldReturnResult(result);
                var byId = mut.getById(TestAgg, id, 0);
                byId.must.reject.error(Error, 'Aggregate Deleted: '+streamName);
            })
        });
        context('when calling getById with proper args but stream not found', function (){
            it('should throw proper error', function () {
                var data = JSON.stringify(new GesEvent('someEventNotificationOn',null,{blah:'blah'}));
                    var result = {
                    Status: 'StreamNotFound',
                    NextEventNumber:3,
                        Events: [{Event:{EventType:'someAggEvent',Data: data, OriginalEvent: {Metadata: {eventTypeName:'someEventNotificationOn'}}}},
                            {Event:{EventType:'someAggEvent',Data: data, OriginalEvent: {Metadata: {eventTypeName:'someEventNotificationOn'}}}},
                            {Event:{EventType:'someAggEvent',Data: data, OriginalEvent: {Metadata: {eventTypeName:'someEventNotificationOn'}}}}],
                    IsEndOfStream: false
                };
                var id = uuid.v1();
                var streamName = streamNameStrategy(TestAgg.aggregateName(),id);
                gesConnection.readStreamEventForwardShouldReturnResult(result);
                var byId = mut.getById(TestAgg, id, 0);
                byId.must.reject.error(Error, 'Aggregate not found: '+streamName);

            })
        });
    });

});
