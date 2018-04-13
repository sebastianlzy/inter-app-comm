import debug from 'debug';
import isEmpty from 'lodash/isEmpty';

const log = debug('IAC');

const printToHtml = (html) => {
  const  responseHtml = window.document.getElementById('response');
  if (typeof responseHtml !== "undefined" && responseHtml) {
    responseHtml.insertAdjacentHTML('beforeend', html);
  }
};

export default {
  debug: (msg, ...args) => {
    log(msg, ...args);
    printToHtml(`<div style="padding: 5px; color: grey">${msg}</div>`);
  },
  example: (msg) => {
    printToHtml(`<pre style="color: white; padding: 20px; background-color: grey">${msg}</pre>`);
  },
  result: (msg, isTestCasePassing) => {
    const validity = isTestCasePassing ? {msg: "PASS", color: "green"}  : {msg: "FAIL", color: red};
    printToHtml(`<div style="color: ${validity.color}; padding: 5px">${validity.msg} :: ${msg}</div>`);
  }
}
