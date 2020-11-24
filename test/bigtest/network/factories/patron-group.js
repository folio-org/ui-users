import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  id: () => faker.random.uuid(),
  group: '',
  desc: i => `TestDesc${i}`,
  expirationOffsetInDays: '',
  metadata: {
    createdDate: () => '2019-02-05T18:49:20.839+0000',
    updatedDate: () => '2019-02-05T18:49:20.839+0000',
  },
});
