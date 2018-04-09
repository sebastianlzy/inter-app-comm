import moment from 'moment';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import toUpper from 'lodash/toUpper';

export default function (clientId, dispatch, checksum) {

  let topics = {};

  return {
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

  return {
    unSubscribe: unSubscribe(callbackId),
  };
},
  publish: (topicName, args) => {
    return dispatch({type: `INTERAPP_COMMUNICATION_${toUpper(topicName)}`, payload: args});
  },
  actions: {
    isChecksumValid: (val) => {return checksum === val;},
    setNotification: (notificationType, msg) => {
      return dispatch({
        type: 'NOTIFICATION_UPDATE',
        meta: {
          message: msg,
          level: notificationType,
        },
      });
    },
  },
  getTopic: (topicName) => get(topics, topicName),
};
}
