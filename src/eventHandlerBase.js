/**
 * Created by rharik on 6/18/15.
 */

module.exports = function(eventstore, readstorerepository, eventmodels, logger) {
    return class eventHandlerBase {
        constructor() {
            this.responseMessage;
            this.continuationId;
            this.handlesEvents = [];
            this.result;
            this.eventHandlerName;
        }

        async handleEvent(gesEvent) {
            logger.debug('handleEvent | checking event for idempotence');
            var idempotency = await readstorerepository.checkIdempotency(gesEvent.originalPosition, this.eventHandlerName);
            if (!idempotency.isIdempotent) {
                logger.debug('handleEvent | event is not idempotent');
                return;
            }
            logger.trace('handleEvent | event idempotent');

            try {
                console.log('gesEventxxxxxxxxxxxxxxx');
                console.log(gesEvent);
                logger.info('handleEvent | calling specific event handler for: ' + gesEvent.eventName + ' on ' + this.eventHandlerName);
                this.createNotification(gesEvent);

                this[gesEvent.eventName](gesEvent.data);

                logger.trace('handleEvent | event Handled by: ' + gesEvent.eventName + ' on ' + this.eventHandlerName);
                readstorerepository.recordEventProcessed(gesEvent.originalPosition, this.eventHandlerName, idempotency.isNewStream);

            } catch (exception) {
                logger.error('handleEvent | event: ' + gesEvent.friendlyDisplay() + ' threw exception: ' + exception);

                this.responseMessage = eventmodels.notificationEvent("Failure", exception.message, gesEvent);

            } finally {
                logger.trace('handleEvent | beginning to process responseMessage');
                var responseEvent = responseMessage.toEventData();
                console.log('responseEventxxxxxxxxxxxxxxxx');
                console.log(responseEvent.friendlyDisplay());
                logger.debug('handleEvent | response event created: ' + responseEvent.friendlyDisplay());

                var appendData = {
                    expectedVersion: -2,
                    events: [responseEvent]
                };


                logger.debug('handleEvent | event data created: ' + appendData);
                logger.trace('handleEvent | publishing notification');
                this.result = await eventstore.appendToStreamPromise('notification', appendData);

            }
            // largely for testing purposes, sadly
            return this.result;
        }

        createNotification(gesEvent){
            logger.debug('createNotification | building response notification');
            this.responseMessage = eventmodels.notificationEvent("Success", "Success", gesEvent);
            logger.trace('createNotification | getting continuation Id: ' + this.responseMessage.continuationId);
        }
    }
};
