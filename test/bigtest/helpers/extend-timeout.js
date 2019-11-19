import Interactor from '@bigtest/interactor';

// Increase timeout globally for all Interactors to 10s

// This is a terrible hack which should be removed when
// there is a way to override harcoded 2000ms in Convergence:
// https://github.com/bigtestjs/convergence/blob/master/src/convergence.js#L104

Interactor.prototype.when = function (assertion) {
  return new this.constructor({
    _queue: [{ assertion }],
    timeout: 10000,
  }, this);
};

Interactor.prototype.timeout = function (timeout) {
  if (typeof timeout !== 'undefined') {
    const _timeout = (timeout < 10000) ? 10000 : timeout;
    return new this.constructor(_timeout, this);
  } else {
    return this._timeout;
  }
};
