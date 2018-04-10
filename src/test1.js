import get from 'lodash/get';
import noop from 'lodash/noop';

import log from "./log";

let testProgress = 0;
let interAppCommunication = {};


const nextTestCase = () => {
  const cases = [
    () => (log.debug('TEST 1 :: Waiting for Web Client to generate secret payload')),
    () => {
      log.debug('TEST 2 :: Waiting for App Client to register client');
      log.example(`client = window.interAppCommunication.registerClient('mobileIos')`)
    },
    () => {
      log.debug('TEST 3 :: Waiting for App Client to subscribe to "VERIFY_PAYLOAD"');
      log.example(`client.subscribe('VERIFY_PAYLOAD', (secretPayload) =>(window.interAppCommunication.verifySecretPayload(secretPayload)))`)
    },
    () => {
      log.debug('TEST 4 :: Waiting for Web Client to publish event "VERIFY_PAYLOAD" with secretPayload');
      interAppCommunication.publish('VERIFY_PAYLOAD', interAppCommunication.getSecretPayload());
    },
    () => log.debug('TEST 5 :: Waiting for Web Client to verify payload'),
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
      if (eventName === 'secretPayloadGenerated') {
        handleEvent('Web client generated secret payload');
      }
    },
    () => {
      if (eventName === 'registerClient') {
        handleEvent('App client is registered with Web Client');
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


  log.debug('================== TEST 1: It should allow 2 way communication ==================');

  nextTestCase();
  interAppCommunication = initWebClient(handleEventChange);


}
