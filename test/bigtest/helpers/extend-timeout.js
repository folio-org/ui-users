import Interactor from '@bigtest/interactor';

// increase timeout globally for all Interactors to 10s
Interactor.prototype.when = function (assertion) {
  return new this.constructor({
    _queue: [{ assertion }],
  }, {
    _timeout: 10000,
    _queue: this._queue,
  });
};

Interactor.prototype.timeout = function (timeout) {
  if (typeof timeout !== 'undefined') {
    const _timeout = (timeout < 10000) ? 10000 : timeout;
    return new this.constructor(_timeout, this);
  } else {
    return this._timeout;
  }
};
