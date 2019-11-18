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
