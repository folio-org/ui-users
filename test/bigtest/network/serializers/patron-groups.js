import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({

  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);
    const { patronGroups = [] } = json;

    json.totalRecords = patronGroups.length;

    return json;
  }
});
