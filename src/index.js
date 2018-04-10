import forEach from 'lodash/forEach';
import set from 'lodash/set';
import get from 'lodash/get';
import queryString from 'query-string';

import log from './log';
import test1 from './test1'

import createInterAppCommunication from './createInterAppCommunication'

function setInterAppCommunicationToGlobal(interAppCommunication) {
  set(window, 'interAppCommunication', interAppCommunication)
}

function initWebClient(onEvent) {
  const appClients = get(window, 'registerClients', []);
  const interAppCommunication = createInterAppCommunication({}, onEvent);
  onEvent('createInterAppCommunication');
  setInterAppCommunicationToGlobal(interAppCommunication);

  forEach(appClients, function(registerClient) {
    onEvent('registerClient', registerClient);
    try {
      registerClient(interAppCommunication)
    } catch (e) {
      console.error(get(e, 'message'))
    }
  });
  return interAppCommunication;
}

const {test} = queryString.parse(window.location.search);

if (test === '1') {
  test1(initWebClient)
}

if (test === '2') {
  setTimeout(initWebClient, 5000);
}
