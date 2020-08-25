const newUser = require('./new-user.js');
const patronGroup = require('./patron-group.js');
const newPermissionSet = require('./new-permission-set.js');

module.exports.test = function meh(uitestctx, nightmare) {
  patronGroup.test(uitestctx, nightmare);
  newUser.test(uitestctx, nightmare);
  newPermissionSet.test(uitestctx, nightmare);
};
