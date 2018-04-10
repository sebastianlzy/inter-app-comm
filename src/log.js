import debug from 'debug';
import isEmpty from 'lodash/isEmpty';

const log = debug('IAC');

export default {
  debug: (msg, ...args) => {
    log(msg, ...args);
    const  responseHtml = window.document.getElementById('response');
    if (typeof responseHtml !== "undefined" && responseHtml) {
      responseHtml.insertAdjacentHTML('beforeend', `<div>${msg}</div>`);
    }
  }
}
