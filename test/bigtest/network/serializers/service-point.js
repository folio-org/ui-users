import ApplicationSerializer from './application';

const { isArray } = Array;
const { assign } = Object;

export default ApplicationSerializer.extend({

  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);

    if (isArray(json.servicePoints)) {
      return assign({}, { servicepoints: json.servicePoints }, {
        totalRecords: json.servicePoints.length,
      });
    }

    return json.servicePoints;
  }

});
