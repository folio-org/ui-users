import ApplicationSerializer from './application';

const { isArray } = Array;

export default ApplicationSerializer.extend({

  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);

    if (isArray(json.credentials)) {
      return { ...json, totalRecords: json.credentials.length };
    }

    return json.credentials;
  }

});
