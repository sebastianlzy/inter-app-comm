import moment from 'moment';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import toUpper from 'lodash/toUpper';
import log from "./log";

export default function (clientId, actions, onEvent) {
  let topics = {};

  return {
    actions,
    id: clientId,
    subscribe: (topicName, callback) => {
      const callbackId = moment.now();

      if (isEmpty(topics[topicName])) {
        topics[topicName] = {};
      }
      topics[topicName][callbackId] = callback;

      const unSubscribe = (callbackId) => () => {
        delete topics[topicName][callbackId];
      };

      onEvent('subscribe', topicName, clientId);
      return {
        unSubscribe: unSubscribe(callbackId),
      };
    },
    getTopic: (topicName) => get(topics, topicName),
  };
}
