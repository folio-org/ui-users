import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  id: () => faker.random.uuid(),
  outputFormats: ['text/html'],
  templateResolver: 'mustache',
  localizedTemplates : {
    en : {
      header: 'Soe subject',
      body: ''
    }
  },
  name : faker.random.word(),
  active: true,
  category: 'FeeFineAction'
});
