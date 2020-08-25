import ApplicationSerializer from './application';

const { isArray } = Array;

export default ApplicationSerializer.extend({

  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);

    if (isArray(json.patronBlockConditions)) {
      return { ...json, totalRecords: json.patronBlockConditions.length };
    }

    return json.patronBlockConditions;
  }

});
