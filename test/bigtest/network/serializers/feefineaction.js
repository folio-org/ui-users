import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);

    if (Array.isArray(json.feefinesactions)) {
      json.totalRecords = json.feefinesactions.length;
    }

    return json;
  }
});
