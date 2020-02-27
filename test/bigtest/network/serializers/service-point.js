import ApplicationSerializer from './application';

const { isArray } = Array;

export default ApplicationSerializer.extend({

  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);

    if (isArray(json.servicePoints)) {
      return { servicepoints: json.servicePoints, totalRecords: json.servicePoints.length };
    }

    return json.servicePoints;
  }

});
