/**
 * Created by parallels on 9/7/15.
 */
module.exports = function(_fantasy){
    return {
        getById(id,table){
            return {};
        },

        save(table, document, id){
        },

        checkIdempotency(originalPosition, eventHandlerName){
            return _fantasy.Future((rej, ret)=> {
                if (originalPosition == 'success') {
                    ret({
                        isIdempotent: true,
                        isNewStream : true
                    });
                } else if (originalPosition == 'failure') {
                    ret({
                        isIdempotent: false,
                        isNewStream : true
                    });
                }else if(originalPosition=='error'){
                    rej('there was an error processing your request');
                }else {
                    throw(new Error('Exception'));
                }
            });
        },

        recordEventProcessed(originalPosition, eventHandlerName){

        }
    }
};
