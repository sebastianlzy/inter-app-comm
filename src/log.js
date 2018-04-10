import debug from 'debug';
import isEmpty from 'lodash/isEmpty';

const log = debug('IAC');

export default {
  debug: (msg, ...args) => {
    log(msg, ...args);
    if(!isEmpty(window.document.getElementById)) {
      const responseHtml = window.document.getElementById('response');
      responseHtml.insertAdjacentHTML('beforeend', `<div>${msg}</div>`);
    }
  }
}
