import forEach from 'lodash/forEach';
import set from 'lodash/set';
import get from 'lodash/get';

import log from './log';

import createInterAppCommunication from './createInterAppCommunication'

function setInterAppCommunicationToGlobal(interAppCommunication) {
  set(window, 'interAppCommunication', interAppCommunication)
}

function initWebClient() {
  const appClients = get(window, 'registerClients', []);
  const interAppCommunication = createInterAppCommunication();
  log.debug('Created interAppCommunication : ', interAppCommunication);
  setInterAppCommunicationToGlobal(interAppCommunication);

  forEach(appClients, function(registerClient) {
    log.debug('Found App Client : ', registerClient);
    try {
      registerClient(interAppCommunication)
    } catch (e) {
      console.error(get(e, 'message'))
    }
  });
}

setTimeout(initWebClient, 5000);

