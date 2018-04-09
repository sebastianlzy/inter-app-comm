import get from 'lodash/get';
import set from 'lodash/set';
import forEach from 'lodash/forEach';
import noop from 'lodash/noop';
import toUpper from 'lodash/toUpper';

import log from './log';
import createClient from './createClient';

export default function (store = {dispatch: noop}, actions = () => ({})) {
  let clients = {};
  let checksum = '';

  const setChecksum = (val) => {
    log.debug('Set checksum : ', val);
    checksum = val
  };

  const publish = (dispatch) => (eventName, args) => {
    return dispatch({
      type: `INTERAPP_COMMUNICATION_${toUpper(eventName)}`,
      payload: args,
    })
  };

  return {
    registerClient: (clientId) => {
      if (get(clients, clientId)) {
        throw new Error('Client has been registered');
      }
      const listOfActions = actions(store.dispatch);
      set(clients, clientId, createClient(clientId, {
        ...listOfActions,
        setChecksum,
        publish: publish(store.dispatch)
      }));

      log.debug('Register client : ', clientId);
      return get(clients, clientId);
    },
    getClients: () => {
      log.debug('Get all clients : ', clients);
      return clients;
    },
    unregisterClient: (client) => {
      const clientId = get(client, 'id');
      log.debug('Unregister client : ', clientId);
      clientId ? delete clients[clientId] : null;
    },
    publish: (topicName, ...args) => {
      forEach(clients, (client) => {
        const callbacks = client.getTopic(topicName);
        log.debug('Publishing : ', topicName);
        log.debug('Callback : ', callbacks);
        forEach(callbacks, (callback) => callback(...args, checksum));
      });
    },
  };
}
