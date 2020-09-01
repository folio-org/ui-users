import ApplicationSerializer from './application';

const { isArray } = Array;

export default ApplicationSerializer.extend({
  embed: true,
  include: ['personal'],
  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);

    if (isArray(json.users)) {
      return { ...json,
        totalRecords: json.users.length,
        resultsInfo: {
          totalRecords: json.users.length,
          facets: [],
          diagnostics: []
        } };
    }

    return json.users || json.user;
  }
});
