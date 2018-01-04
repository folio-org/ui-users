const new_user = require('./new_user.js');
const patron_group = require('./patron_group.js');
const new_permission_set = require('./new_permission_set.js');

module.exports.test = function(uitestctx) {

  patron_group.test(uitestctx);
  new_user.test(uitestctx);
  new_permission_set.test(uitestctx);

}
