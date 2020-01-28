import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);

    json.totalRecords = json.loanactions.length;
    json.loansHistory = json.loanactions;
    delete json.loanactions;
    return json;
  }
});
