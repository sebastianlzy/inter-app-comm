import {expect} from 'chai';
import createInterAppCommunication from '../interAppCommunication';
import isEmpty from 'lodash/isEmpty';

describe('shared.src.interAppCommunication.index', () => {
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

    expect(allClients[firstClientId].id).to.be.equal('mobileIos');
    expect(allClients[secondClientId].id).to.be.equal('mobileIos2');
  });

  it('should allow client to unregisterClient', () => {

    const mobileIos1 = interAppCommunication.registerClient('mobileIos1');
    interAppCommunication.registerClient('mobileIos2');

    const allClients = interAppCommunication.getClients();
    interAppCommunication.unregisterClient(mobileIos1);
    const firstClientId = Object.keys(allClients)[0];
    const secondClientId = Object.keys(allClients)[1];

    expect(allClients[firstClientId].id).to.be.equal('mobileIos2');
    expect(allClients[secondClientId]).to.be.undefined;
  });

  it('should allow client to subscribe to event', (done) => {

    const isCallbackTracked = {
      1: false,
      2: false,
    };

    const expectCallback = (callbackId) => (msg) => {
      expect(msg).to.be.equal('Sending message to event, I_AM_AN_EVENT_NAME');
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

    const payload1 = mobileIos1.publish('i_am_an_event_name', 'sending message to web 1');
    expect(payload1).to.be.deep.equal({type: 'INTERAPP_COMMUNICATION_I_AM_AN_EVENT_NAME', payload: 'sending message to web 1'});

    const payload2 = mobileIos2.publish('i_am_an_event_name', 'sending message to web 2');
    expect(payload2).to.be.deep.equal({type: 'INTERAPP_COMMUNICATION_I_AM_AN_EVENT_NAME', payload: 'sending message to web 2'});
  });

  it('should allow client to set notification', () => {
    const mobileIos1 = interAppCommunication.registerClient('mobileIos1');

    const payload1 = mobileIos1.actions.setNotification('success', 'setting notification msg');
    expect(payload1).to.be.deep.equal({
      type: 'NOTIFICATION_UPDATE',
      meta: {
        level: 'success',
        message: 'setting notification msg',
      },
    });
  });

  it('should ensure checksum is valid', function (done) {
    const mobileIos1 = interAppCommunication.registerClient('mobileIos1');
    interAppCommunication.getChecksum((checksum) => {
      expect(mobileIos1.actions.isChecksumValid(checksum)).to.be.true;
      done();
    });
  });

  it('should allow client to unsubscribe to event', function () {
    const expectCallback = (msg) => msg;
    const mobileIos1 = interAppCommunication.registerClient('mobileIos1');
    const event1 = mobileIos1.subscribe('I_AM_AN_EVENT_NAME', expectCallback);
    expect(isEmpty(mobileIos1.getTopic('I_AM_AN_EVENT_NAME'))).to.be.false;
    event1.unSubscribe();
    expect(isEmpty(mobileIos1.getTopic('I_AM_AN_EVENT_NAME'))).to.be.true;
  });
});
