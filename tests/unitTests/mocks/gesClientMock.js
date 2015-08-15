/**
 * Created by reharik on 6/10/15.
 */


module.exports = function(uuid, SubscriptionMock) {

    return function gesClientMock(opts) {
        var subscription;
        var _appendToStreamShouldFail;
        var _readStreamEventForwardShouldFail;
        var readStreamEventForwardResult;
        var val = opts.val;
        var id = uuid.v1();
        var clean = function(){
            console.log('cleaning gesClient');
            subscription= null;
            _appendToStreamShouldFail = false;
            _readStreamEventForwardShouldFail = false;
            readStreamEventForwardResult = null;
        };

        var subscribeToStream = function () {
            console.log('mock stream subscription');
            subscription = new SubscriptionMock();
            return subscription;
        };

        var subscribeToStreamFrom = function () {
            console.log('mock stream subscription');
            subscription = new SubscriptionMock();
            return subscription;
        };

        var subscribeToAllFrom = function () {
            console.log('mock stream subscription');
            subscription = new SubscriptionMock();
            return subscription;
        };

        var getSubscription = function(){ return subscription; };
        var getId = function(){ return id; };

        var appendToStream = function (streamName, data, cb) {
            console.log('mock append');
            if(!subscription){subscription = subscribeToStream()}
            var results = {streamName: streamName, data: data};
            subscription.emit(streamName,results);

            if (_appendToStreamShouldFail) {
                cb(results);
            }
            else {
                cb(null, results);
            }
        };

        var readStreamEventsForward = function (streamName, skipTake, cb) {
            console.log('mock read');
            var results = {streamName: streamName, skipTake: skipTake, result: readStreamEventForwardResult};
            if (_readStreamEventForwardShouldFail) {
                cb(readStreamEventForwardResult ? readStreamEventForwardResult : results);
            }
            else {
                cb(null, readStreamEventForwardResult ? readStreamEventForwardResult : results);
            }
        };
        var readStreamEventForwardShouldReturnResult = function (result) {
            readStreamEventForwardResult = result;
        };
        var readStreamEventForwardShouldFail = function () {
            _readStreamEventForwardShouldFail = true;
        };
        var appendToStreamShouldFail = function () {
            _appendToStreamShouldFail = true;
        };

        return {
            clean:clean,
            getId:getId,
            getSubscription:getSubscription,
            subscribeToStream: subscribeToStream,
            subscribeToStreamFrom: subscribeToStreamFrom,
            subscribeToAllFrom:subscribeToAllFrom,
            appendToStream: appendToStream,
            readStreamEventsForward: readStreamEventsForward,
            readStreamEventForwardShouldReturnResult: readStreamEventForwardShouldReturnResult,
            readStreamEventForwardShouldFail: readStreamEventForwardShouldFail,
            appendToStreamShouldFail: appendToStreamShouldFail
        }

    };
};

