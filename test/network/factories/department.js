import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  id: () => faker.random.uuid(),
  name: i => `TestName${i}`,
  code: i => `TestCode${i}`,
  usageNumber: 0,
  metadata: {
    createdDate: () => '2019-02-05T18:49:20.839+0000',
    createdByUserId: () => 'ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd',
    updatedDate: () => '2019-02-05T18:49:20.839+0000',
    updatedByUserId: () => 'ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd'
  },
});
