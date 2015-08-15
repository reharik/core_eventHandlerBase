/**
 * Created by rharik on 6/19/15.
 */

module.exports = function(){
    return function(truth) {
        return function(){
            return truth;
        }
    }
};