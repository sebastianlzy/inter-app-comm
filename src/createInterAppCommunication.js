import get from 'lodash/get';
import set from 'lodash/set';
import forEach from 'lodash/forEach';
import moment from 'moment';
import noop from 'lodash/noop';

import createClient from './createClient';

export default function (actions = {}, onEvent = noop) {
  let clients = {};
  let secretPayload = moment.now();
  onEvent('secretPayloadGenerated', secretPayload);
  return {
    verifySecretPayload: (secret) => {
      onEvent('verifySecretPayload', secret === secretPayload)
    },
    registerClient: (clientId) => {
      if (get(clients, clientId)) {
        throw new Error('Client has been registered');
      }

      set(clients, clientId, createClient(clientId, actions, onEvent));
      onEvent('registerClient', clientId);
      return get(clients, clientId);
    },
    getClients: () => {
      onEvent('getClients', clients);
      return clients;
    },
    unregisterClient: (client) => {
      const clientId = get(client, 'id');
      onEvent('unregisterClient', clientId);

      clientId ? delete clients[clientId] : null;
    },
    getSecretPayload: () => secretPayload,
    publish: (topicName, ...args) => {
      onEvent('publish', topicName);
      forEach(clients, (client) => {
        const callbacks = client.getTopic(topicName);
        forEach(callbacks, (callback) => callback(...args));
      });
    },
  };
}
