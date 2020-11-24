import {
  belongsTo,
  Model,
} from 'miragejs';

export default Model.extend({
  patronGroup: belongsTo('user'),
});
