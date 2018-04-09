import get from 'lodash/get';
import set from 'lodash/set';
import forEach from 'lodash/forEach';
import createClient from './createClient';
import moment from 'moment';

export default function (store) {
  let clients = {};
  let checksum = moment.now();

  return {
    registerClient: (clientId) => {
      if (get(clients, clientId)) {
        throw new Error('Client has been registered');
      }
      set(clients, clientId, createClient(clientId, store.dispatch, checksum));
      return get(clients, clientId);
    },
    getClients: () => {
      return clients;
    },
    unregisterClient: (client) => {
      const clientId = get(client, 'id');
      clientId ? delete clients[clientId] : null;
    },
    getChecksum: (callback) => {
      callback(checksum);
    },
    publish: (topicName, ...args) => {
      forEach(clients, (client) => {
        const callbacks = client.getTopic(topicName);
        forEach(callbacks, (callback) => callback(...args));
      });
    },
  };
}
