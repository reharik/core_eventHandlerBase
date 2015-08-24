/**
 * Created by rharik on 6/18/15.
 */

var eventModels = require('eventmodels')();

module.exports = function(eventStore, readStoreRepository, logger, _options) {
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
            var idempotency = await readStoreRepository.checkIdempotency(gesEvent.originalPosition, this.eventHandlerName);
            if (!idempotency.isIdempotent) {
                logger.debug('handleEvent | event is not idempotent');
                return;
            }
            logger.trace('handleEvent | event idempotent');

            try {
                logger.info('handleEvent | calling specific event handler for: ' + gesEvent.eventName + ' on ' + this.eventHandlerName);
                this.createNotification(gesEvent);

                this[gesEvent.eventName](gesEvent.data);

                logger.trace('handleEvent | event Handled by: ' + gesEvent.eventName + ' on ' + this.eventHandlerName);
                readStoreRepository.recordEventProcessed(gesEvent.originalPosition, this.eventHandlerName, idempotency.isNewStream);

            } catch (exception) {
                logger.error('handleEvent | event: ' + JSON.stringify(gesEvent) + ' threw exception: ' + exception);

                this.responseMessage = eventModels.notificationEvent("Failure", exception.message, gesEvent);

            } finally {

                logger.trace('handleEvent | beginning to process responseMessage');

                var responseEvent = eventModels.eventData(
                    this.responseMessage.eventName,
                    this.responseMessage.data,
                    {"continuationId": this.continuationId,
                        "eventName":"notification",
                        "streamType":"notification"});

                logger.debug('handleEvent | response event created: ' + JSON.stringify(responseEvent));

                var appendData = {
                    expectedVersion: -2,
                    events: [responseEvent]
                };

                logger.debug('handleEvent | event data created: ' + JSON.stringify(appendData));
                logger.trace('handleEvent | publishing notification');

                this.result = eventStore.appendToStreamPromise('notification', appendData);

            }
            // largely for testing purposes, sadly
            return this.result;
        }

        createNotification(gesEvent){
            logger.debug('createNotification | building response notification');
            this.responseMessage = eventModels.notificationEvent("Success", "Success", gesEvent);
            this.continuationId = gesEvent.metadata.continuationId;
            logger.trace('createNotification |getting continuation Id: ' + this.continuationId);
        }
    };
};