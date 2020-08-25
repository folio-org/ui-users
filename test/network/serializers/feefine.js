import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);

    if (Array.isArray(json.feefines)) {
      json.totalRecords = json.feefines.length;
      json.resultInfo = {
        totalRecords: json.totalRecords,
        facets: [],
        diagnostics: [],
      };
    }

    return json;
  }
});
