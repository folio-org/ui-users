import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);

    if (Array.isArray(json.manualblocks)) {
      json.totalRecords = json.manualblocks.length;
      json.resultInfo = {
        totalRecords: json.totalRecords,
        facets: [],
        diagnostics: [],
      };
    }

    return json;
  }
});
