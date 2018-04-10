import debug from 'debug';

const log = debug('IAC');

export default {
  debug: (msg, ...args) => {
    log(msg, ...args);
    const responseHtml = document.getElementById('response');
    responseHtml.insertAdjacentHTML('beforeend', `<div>${msg}</div>`);
  }
}
