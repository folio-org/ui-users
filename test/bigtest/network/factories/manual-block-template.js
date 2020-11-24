import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  id: () => faker.random.uuid(),
  name: (i) => 'Manual block template' + i,
  code: (i) => 'MBT' + i,
  desc: (i) => 'Description for MBT' + i,
  blockTemplate: {
    desc: (i) => 'Manual block' + i,
    patronMessage: (i) => 'Patron message of mb' + i,
    borrowing: () => true,
    renewals: () => false,
    requests: () => true,
  },
  metadata: {
    createdDate: () => '2019-02-05T18:49:20.839+0000',
    createdByUserId: () => '2d91d36d-618c-5b36-b4b7-986a041bf397',
    updatedDate: () => '2019-02-05T18:49:20.839+0000',
    updatedByUserId: () => '2d91d36d-618c-5b36-b4b7-986a041bf397',
  },
});
