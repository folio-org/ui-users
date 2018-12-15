import ApplicationSerializer from './application';

const { isArray } = Array;
const { assign } = Object;

export default ApplicationSerializer.extend({

  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);

    if (isArray(json.users)) {
      return assign({}, json, {
        totalRecords: json.users.length,
        resultsInfo: {
          totalRecords: json.users.length,
          facets: [],
          diagnostics: []
        }
      });
    }

    return json.users;
  }
});
