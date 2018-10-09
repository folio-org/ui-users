const newUser = require('./new_user.js');
const patronGroup = require('./patron_group.js');
const newPermissionSet = require('./new_permission_set.js');

module.exports.test = function meh(uitestctx, nightmare) {
  patronGroup.test(uitestctx, nightmare);
  newUser.test(uitestctx, nightmare);
  newPermissionSet.test(uitestctx, nightmare);
};
