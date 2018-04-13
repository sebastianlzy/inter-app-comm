import get from 'lodash/get';
import noop from 'lodash/noop';

import log from "./log";

let testProgress = 0;
let interAppCommunication = {};


const nextTestCase = () => {
  const cases = [
    () => (log.debug('TEST :: Waiting for Web client to be loaded')),
    () => (log.debug('TEST :: Waiting for Web client to generate secret payload')),
    () => {
      log.debug('TEST :: Waiting for App client to register client');
      log.example(`testOne.registerClient()`)
    },
    () => {
      log.debug('TEST :: Waiting for App client to subscribe to "VERIFY_PAYLOAD"');
      log.example(`testOne.subscribe((secretPayload) => (window.interAppCommunication.verifySecretPayload(secretPayload)))`)
    },
    () => {
      setTimeout(() => {
        log.debug(`TEST :: Waiting for Web client to publish event "VERIFY_PAYLOAD" with secretPayload : ${interAppCommunication.getSecretPayload()}`);
        interAppCommunication.publish('VERIFY_PAYLOAD', interAppCommunication.getSecretPayload());
      }, 0)
    },
    () => log.debug('TEST :: Waiting for Web client to verify payload'),
    () => log.debug('TEST :: END OF TEST')
  ];
  const testDescription = get(cases, testProgress, noop);
  testDescription()
};

const updateTestProgress = (step) => {
  if ((step - 1) === testProgress) {
    testProgress++;
  }
};

const handleEvent = (msg, isTestCasePassing = true) => {
  updateTestProgress(testProgress + 1);
  log.result(msg, isTestCasePassing);
  nextTestCase();
};

const handleEventChange = (eventName, ...args) => {

  const cases = [
    () => {
      if (eventName === 'createInterAppCommunication') {
        handleEvent(`Web client is loaded`);
      }
    },
    () => {
      if (eventName === 'secretPayloadGenerated') {
        handleEvent(`Web client generated secret payload : ${args[0]}`);
      }
    },
    () => {
      if (eventName === 'registerClient') {
        handleEvent('App client is registered with Web client');
      }
    },
    () => {
      if (eventName === 'subscribe' && args[0] === 'VERIFY_PAYLOAD') {
        handleEvent('App client is subscribe to VERIFY_PAYLOAD');
      }
    },
    () => {
      if (eventName === 'publish' && args[0] === 'VERIFY_PAYLOAD') {
        handleEvent('Web client publish event "VERIFY_PAYLOAD"');
      }
    },
    () => {
      if (eventName === 'verifySecretPayload') {
        handleEvent(`Web client verified secret payload`, args[0]);
      }
    }
  ];
  cases[testProgress]();
};

export default function (initWebClient) {

  let client;
  nextTestCase();
  interAppCommunication = initWebClient(handleEventChange);

  window.testOne = {
    registerClient: () => {
      client = window.interAppCommunication.registerClient('testOneClient')
    },
    subscribe: (callback) => {
      client.subscribe('VERIFY_PAYLOAD', callback)
    }
  }
}
