import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);
    const { permissions = [] } = json;

    json.totalRecords = permissions.length;

    return json;
  }
});
