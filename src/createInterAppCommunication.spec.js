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

  it('should allow client to publish event', () => {
    const mobileIos1 = interAppCommunication.registerClient('mobileIos1');
    const mobileIos2 = interAppCommunication.registerClient('mobileIos2');

    const payload1 = mobileIos1.actions.publish('i_am_an_event_name', 'sending message to web 1');
    expect(payload1).toEqual({type: 'INTERAPP_COMMUNICATION_I_AM_AN_EVENT_NAME', payload: 'sending message to web 1'});

    const payload2 = mobileIos2.actions.publish('i_am_an_event_name', 'sending message to web 2');
    expect(payload2).toEqual({type: 'INTERAPP_COMMUNICATION_I_AM_AN_EVENT_NAME', payload: 'sending message to web 2'});
  });

  it('should take in actions', () => {
    const actions = () => ({setNotification: (payload) => payload});
    const newInterAppCommunication = interAppCommunication = createInterAppCommunication(store, actions);
    const mobileIos1 = newInterAppCommunication.registerClient('mobileIos1');

    const payload1 = mobileIos1.actions.setNotification('success');
    expect(payload1).toEqual('success');
  });

  it('should ensure checksum is valid', function (done) {
    const mobileIos1 = interAppCommunication.registerClient('mobileIos1');
    const checksumVal = 'I_AM_A_CHECKSUM';
    mobileIos1.actions.setChecksum(checksumVal);
    mobileIos1.subscribe('GET_CHECKSUM', (checksum) => {
      expect(checksum).toEqual(checksumVal);
      done();
    });
    interAppCommunication.publish('GET_CHECKSUM');
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
