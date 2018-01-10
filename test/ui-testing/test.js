const newUser = require('./new_user.js');
const patronGroup = require('./patron_group.js');
const newPermissionSet = require('./new_permission_set.js');

module.exports.test = function meh(uitestctx) {
  patronGroup.test(uitestctx);
  newUser.test(uitestctx);
  newPermissionSet.test(uitestctx);
};
