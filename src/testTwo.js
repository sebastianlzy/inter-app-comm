import get from 'lodash/get';
import noop from 'lodash/noop';
import isEmpty from 'lodash/isEmpty';

import log from "./log";

let testProgress = 0;
let interAppCommunication = {};


const nextTestCase = () => {
  const cases = [
    () => {
      log.debug('TEST :: Waiting for App client to register to window.registerClients');
      log.example(`
        window.registerClients = [(webClient) => {
            testTwo.registerClient(webClient);
            testTwo.subscribe((payload) => webClient.verifySecretPayload(payload));
        }];`
      )
    },
    () => (log.debug('TEST :: Waiting for Web client to generate secret payload')),
    () => (log.debug('TEST :: Waiting for App client to register client')),
    () => (log.debug('TEST :: Waiting for App client to subscribe to "VERIFY_PAYLOAD"')),
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

const delayInitOfWebClient = (initWebClient, delayTime, limit = 0) => {
  const maxNoOfTries = 5;

  setTimeout(() => {
    if (!isEmpty(window.registerClients)) {
      return interAppCommunication = initWebClient(handleEventChange);
    }
    if (limit === maxNoOfTries) {
      log.result("No client is registered to window.registerClients", false);
      return;
    }

    log.debug('Waiting for client to register with window.registerClients');
    log.debug(`Number of attempts left :: ${maxNoOfTries - limit}`);
    return delayInitOfWebClient(initWebClient, delayTime, limit + 1);
  }, delayTime);
};

export default function (initWebClient) {
  let client;

  nextTestCase();
  window.testTwo = {
    registerClient: (webClient) => client = webClient.registerClient('testTwoClient'),
    subscribe: (callback) => client.subscribe('VERIFY_PAYLOAD', callback)
  };

  delayInitOfWebClient(initWebClient, 5000);
}
