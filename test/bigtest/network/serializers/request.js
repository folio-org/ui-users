import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);

    json.totalRecords = json.requests.length;

    return json;
  }
});
