import createInterAppCommunication from './createInterAppCommunication';
import isEmpty from 'lodash/isEmpty';

describe('createInterAppCommunication', () => {
  const store = {
    dispatch: (action) => action,
  };
  let interAppCommunication = createInterAppCommunication(store);

  beforeEach(function () {
    interAppCommunication = createInterAppCommunication(store);
  });

  it('should allow client to register', () => {

    interAppCommunication.registerClient('mobileIos');
    interAppCommunication.registerClient('mobileIos2');
    const allClients = interAppCommunication.getClients();
    const firstClientId = Object.keys(allClients)[0];
    const secondClientId = Object.keys(allClients)[1];

    expect(allClients[firstClientId].id).toBe('mobileIos');
    expect(allClients[secondClientId].id).toBe('mobileIos2');
  });

  it('should allow client to unregisterClient', () => {

    const mobileIos1 = interAppCommunication.registerClient('mobileIos1');
    interAppCommunication.registerClient('mobileIos2');

    const allClients = interAppCommunication.getClients();
    interAppCommunication.unregisterClient(mobileIos1);
    const firstClientId = Object.keys(allClients)[0];
    const secondClientId = Object.keys(allClients)[1];

    expect(allClients[firstClientId].id).toBe('mobileIos2');
    expect(allClients[secondClientId]).toBeUndefined();
  });

  it('should allow client to subscribe to event', (done) => {

    const isCallbackTracked = {
      1: false,
      2: false,
    };

    const expectCallback = (callbackId) => (msg) => {
      expect(msg).toBe('Sending message to event, I_AM_AN_EVENT_NAME');
      isCallbackTracked[callbackId] = true;
      if (isCallbackTracked[1] && isCallbackTracked[2]) {
        done();
      }
    };

    const mobileIos1 = interAppCommunication.registerClient('mobileIos1');
    const mobileIos2 = interAppCommunication.registerClient('mobileIos2');
    mobileIos1.subscribe('I_AM_AN_EVENT_NAME', expectCallback(1));
    mobileIos2.subscribe('I_AM_AN_EVENT_NAME', expectCallback(2));
    interAppCommunication.publish('I_AM_AN_EVENT_NAME', 'Sending message to event, I_AM_AN_EVENT_NAME');
  });

  it('should take in actions', () => {
    const actions = {setNotification: (payload) => payload};
    const newInterAppCommunication = interAppCommunication = createInterAppCommunication(actions);
    const mobileIos1 = newInterAppCommunication.registerClient('mobileIos1');

    const payload1 = mobileIos1.actions.setNotification('success');
    expect(payload1).toEqual('success');
  });

  it('should ensure checksum is valid', function (done) {
    const mobileIos1 = interAppCommunication.registerClient('mobileIos1');
    mobileIos1.subscribe('VERIFY_PAYLOAD', (checksum) => {
      expect(interAppCommunication.verifySecretPayload(checksum)).toEqual(true);
      done();
    });
    interAppCommunication.publish('VERIFY_PAYLOAD', interAppCommunication.getSecretPayload());
  });

  it('should allow client to unsubscribe to event', function () {
    const expectCallback = (msg) => msg;
    const mobileIos1 = interAppCommunication.registerClient('mobileIos1');
    const event1 = mobileIos1.subscribe('I_AM_AN_EVENT_NAME', expectCallback);
    expect(isEmpty(mobileIos1.getTopic('I_AM_AN_EVENT_NAME'))).toBeFalsy();
    event1.unSubscribe();
    expect(isEmpty(mobileIos1.getTopic('I_AM_AN_EVENT_NAME'))).toBeTruthy();
  });
});
