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

        checkIdempotency(event, eventHandlerName){
            return _fantasy.Future((rej, ret)=> {
                if (event.check.path  == 'success') {
                    ret({
                        isIdempotent: true,
                        isNewStream : true,
                        handle:{path:event.handle.path},
                        record:{path:event.record.path},
                        dispatch:{path:event.dispatch.path}
                    });
                } else if (event.check.path == 'failure') {
                    ret({
                        isIdempotent: false,
                        isNewStream : true
                    });
                }else if(event.check.path =='error'){
                    rej('there was an error processing your request');
                }else {
                    throw(new Error('Exception'));
                }
            });
        },

        recordEventProcessed(event, isIdempotent){
            return _fantasy.Future((rej, ret)=> {
                if (isIdempotent.record.path == 'success') {
                    ret('Success');
                }else if(isIdempotent.record.path =='error'){
                    rej('recoding idempotence threw error processing your request');
                }else {
                    throw(new Error('Exception'));
                }
            });
        }
    }
};
