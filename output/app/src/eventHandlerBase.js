/**
 * Created by rharik on 6/18/15.
 */
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

module.exports = function (eventstore, readstorerepository, eventmodels, logger) {
    return (function () {
        function eventHandlerBase() {
            _classCallCheck(this, eventHandlerBase);

            this.responseMessage;
            this.continuationId;
            this.handlesEvents = [];
            this.result;
            this.eventHandlerName;
        }

        _createClass(eventHandlerBase, [{
            key: 'handleEvent',
            value: function handleEvent(gesEvent) {
                var idempotency, responseEvent, appendData;
                return regeneratorRuntime.async(function handleEvent$(context$3$0) {
                    while (1) switch (context$3$0.prev = context$3$0.next) {
                        case 0:
                            logger.debug('handleEvent | checking event for idempotence');
                            context$3$0.next = 3;
                            return regeneratorRuntime.awrap(readstorerepository.checkIdempotency(gesEvent.originalPosition, this.eventHandlerName));

                        case 3:
                            idempotency = context$3$0.sent;

                            if (idempotency.isIdempotent) {
                                context$3$0.next = 7;
                                break;
                            }

                            logger.debug('handleEvent | event is not idempotent');
                            return context$3$0.abrupt('return');

                        case 7:
                            logger.trace('handleEvent | event idempotent');

                            context$3$0.prev = 8;

                            logger.info('handleEvent | calling specific event handler for: ' + gesEvent.eventName + ' on ' + this.eventHandlerName);
                            this.createNotification(gesEvent);

                            this[gesEvent.eventName](gesEvent.data, gesEvent.metadata.continuationId);

                            logger.trace('handleEvent | event Handled by: ' + gesEvent.eventName + ' on ' + this.eventHandlerName);
                            readstorerepository.recordEventProcessed(gesEvent.originalPosition, this.eventHandlerName, idempotency.isNewStream);

                            context$3$0.next = 20;
                            break;

                        case 16:
                            context$3$0.prev = 16;
                            context$3$0.t0 = context$3$0['catch'](8);

                            logger.error('handleEvent | event: ' + gesEvent.friendlyDisplay() + ' threw exception: ' + context$3$0.t0);

                            this.responseMessage = eventmodels.notificationEvent("Failure", context$3$0.t0.message, gesEvent);

                        case 20:
                            context$3$0.prev = 20;

                            logger.trace('handleEvent | beginning to process responseMessage');
                            responseEvent = this.responseMessage.toEventData();

                            logger.debug('handleEvent | response event created: ' + responseEvent.friendlyDisplay());

                            appendData = {
                                expectedVersion: -2,
                                events: [responseEvent]
                            };

                            logger.debug('handleEvent | event data created: ' + appendData);
                            logger.trace('handleEvent | publishing notification');
                            context$3$0.next = 29;
                            return regeneratorRuntime.awrap(eventstore.appendToStreamPromise('notification', appendData));

                        case 29:
                            this.result = context$3$0.sent;
                            return context$3$0.finish(20);

                        case 31:
                            return context$3$0.abrupt('return', this.result);

                        case 32:
                        case 'end':
                            return context$3$0.stop();
                    }
                }, null, this, [[8, 16, 20, 31]]);
            }
        }, {
            key: 'createNotification',
            value: function createNotification(gesEvent) {
                logger.debug('createNotification | building response notification');
                this.responseMessage = eventmodels.notificationEvent("Success", "Success", gesEvent);
                logger.trace('createNotification | getting continuation Id: ' + this.responseMessage.continuationId);
            }
        }]);

        return eventHandlerBase;
    })();
};

// largely for testing purposes, sadly