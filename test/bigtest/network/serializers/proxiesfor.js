import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);

    if (args[1].method === 'POST') {
      return json.proxiesfor;
    }

    json.totalRecords = json.proxiesfors.length;
    json.proxiesFor = json.proxiesfors;
    delete json.proxiesfors;
    return json;
  }
});
