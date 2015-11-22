/**
 * Created by reharik on 11/19/15.
 */

module.exports = function(readstorerepository, eventmodels, R, _fantasy,treis) {

    return function(event, handler){
        var ef = eventmodels.eventFunctions;
        var fh = eventmodels.functionalHelpers;
        var log = function(x){ console.log(x); return x; };

        var Future = _fantasy.Future;

        //checkIfProcessed:: JSON -> Future<string|JSON>
        var checkIfProcessed = function checkIfProcessed(i) {
            return Future((rej, res) => {
                var isIdempotent = R.compose(log, R.chain(R.equals(true)),fh.safeProp('isIdempotent'));
                if (isIdempotent(i) === true) {
                    res(i);
                } else {
                    rej('item has already been processed');
                }
            })
        };

        //checkIdempotence  JSON -> Future<string|JSON>
        var checkIdempotency = R.compose(R.chain(checkIfProcessed), readstorerepository.checkIdempotency);

        return {
            checkIfProcessed,
            checkIdempotency
        }
    }
};