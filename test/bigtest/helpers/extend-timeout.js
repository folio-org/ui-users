import Interactor from '@bigtest/interactor';

// increase timeout globally for all Interactors to 10s
Interactor.prototype.when = function (assertion) {
  const parent = Object.assign(Object.create(Object.getPrototypeOf(this)), this, {
    _timeout: 10000,
  });

  return new this.constructor({
    _queue: [{ assertion }],
  }, parent);
};

Interactor.prototype.timeout = function (timeout) {
  if (typeof timeout !== 'undefined') {
    const _timeout = (timeout < 10000) ? 10000 : timeout;
    return new this.constructor(_timeout, this);
  } else {
    return this._timeout;
  }
};
