import { Factory, faker } from '@bigtest/mirage';

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
