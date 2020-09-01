import { Model, belongsTo } from 'miragejs';

export default Model.extend({
  personal: belongsTo('user-personal')
});
