const new_user = require('./new_user.js');
const patron_group = require('./patron_group.js');
const users = require('./users.js');

module.exports.test = function(uitestctx) {

  patron_group.test(uitestctx);
  users.test(uitestctx);
  new_user.test(uitestctx);

}