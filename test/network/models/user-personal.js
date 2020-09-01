import { Model, hasMany } from 'miragejs';

export default Model.extend({
  addresses: hasMany()
});
