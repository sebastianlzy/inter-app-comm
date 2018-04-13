import forEach from 'lodash/forEach';
import set from 'lodash/set';
import get from 'lodash/get';
import queryString from 'query-string';

import testOne from './testOne';
import testTwo from './testTwo';
import log from './log';

import createInterAppCommunication from './createInterAppCommunication'

function setInterAppCommunicationToGlobal(interAppCommunication) {
  set(window, 'interAppCommunication', interAppCommunication)
}

function initWebClient(onEvent) {
  const appClients = get(window, 'registerClients', []);
  onEvent('createInterAppCommunication');
  const interAppCommunication = createInterAppCommunication({}, onEvent);
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

if (test === 'one') {
  log.debug('Objective: Two way communication');
  log.debug('Assumption: Web client is loaded before App Client ');
  log.debug('Verification 1 : App client will register itself with Web Client');
  log.debug('Verification 2 : App client will subscribe to event with a callback');
  log.debug('Verification 3 : Web client is able to receive information passed from App Client');
  log.debug("=========================================================================================");
  testOne(initWebClient)
}

if (test === 'two') {
  log.debug('Objective: Web client to register App client asynchronously ');
  log.debug('Assumption: App client is loaded before Web Client');
  log.debug('Verification 1 : App client will check if Web Client is loaded');
  log.debug('Verification 2 : App client will set up callback on window.registerClients');
  log.debug('Verification 3 : Web client will pickup from window.registerClients and perform registration');
  log.debug("=========================================================================================");
  testTwo(initWebClient);
}
