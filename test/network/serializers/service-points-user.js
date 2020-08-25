import ApplicationSerializer from './application';

const { isArray } = Array;

export default ApplicationSerializer.extend({

  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);

    if (isArray(json.servicePointsUsers)) {
      return { ...json, totalRecords: json.servicePointsUsers.length };
    }

    return json.servicePointsUsers;
  }

});
