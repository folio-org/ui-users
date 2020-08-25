import ApplicationSerializer from './application';

const { isArray } = Array;

export default ApplicationSerializer.extend({

  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);

    if (isArray(json.waivers)) {
      return {
        waivers: json.waivers,
        totalRecords: json.waivers.length,
      };
    }

    return json;
  }

});
