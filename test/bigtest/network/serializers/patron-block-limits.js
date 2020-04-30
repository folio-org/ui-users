import ApplicationSerializer from './application';

const { isArray } = Array;

export default ApplicationSerializer.extend({
  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);

    if (isArray(json.patronBlockLimits)) {
      return { ...json, totalRecords: json.patronBlockLimits.length };
    }

    return json.patronBlockLimits;
  }
});
