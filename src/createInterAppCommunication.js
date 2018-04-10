import get from 'lodash/get';
import set from 'lodash/set';
import forEach from 'lodash/forEach';
import noop from 'lodash/noop';
import toUpper from 'lodash/toUpper';

import log from './log';
import createClient from './createClient';

export default function (actions = {}) {
  let clients = {};
  let checksum = '';

  const setChecksum = (val) => {
    log.debug(`Set checksum : ${val}`);
    checksum = val
  };

  return {
    registerClient: (clientId) => {
      if (get(clients, clientId)) {
        throw new Error('Client has been registered');
      }

      set(clients, clientId, createClient(clientId, {
        ...actions,
        setChecksum,
      }));

      log.debug(`Registered client : ${clientId}`);
      return get(clients, clientId);
    },
    getClients: () => {
      log.debug(`Get all clients : ${clients.length}`, clients);
      return clients;
    },
    unregisterClient: (client) => {
      const clientId = get(client, 'id');
      log.debug(`Unregister client : ${clientId}`);
      clientId ? delete clients[clientId] : null;
    },
    publish: (topicName, ...args) => {
      forEach(clients, (client) => {
        const callbacks = client.getTopic(topicName);
        log.debug(`Publishing : ${topicName}`);
        forEach(callbacks, (callback) => callback(...args, checksum));
      });
    },
  };
}
