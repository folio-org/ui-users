import ApplicationSerializer from './application';

const { isArray } = Array;
const { assign } = Object;

export default ApplicationSerializer.extend({

  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);
    // eslint-disable-next-line no-debugger
    debugger;
    if (isArray(json.servicePointsUsers)) {
      return assign({}, json, {
        totalRecords: json.servicePointsUsers.length,
      });
    } else {
      return json.servicePointsUsers;
    }
  }

});
