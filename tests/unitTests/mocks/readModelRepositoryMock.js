/**
 * Created by parallels on 7/22/15.
 */
module.exports = function(){
    return {
        getById(id,table){
           return {};
        },

        save(table, document, id){
        },

        isIdempotent(originalPosition, eventHandlerName){
           return true;
        },

        recordEventProcessed(originalPosition, eventHandlerName){

        }
    }
};