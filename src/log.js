import debug from 'debug';

const log = debug('IAC');

export default {
  debug: (msg, ...args) => {
    log(msg, ...args)
  }
}
