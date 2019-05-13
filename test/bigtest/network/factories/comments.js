import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  id: () => faker.random.uuid(),
  paid: false,
  waived: false,
  refunded: true,
  transferredManually: true,

  metadata: {
    createdDate: faker.date.past(0.1, faker.date.past(0.1)).toString(),
    createdByUserId: () => '2d91d36d-618c-5b36-b4b7-986a041bf397',
    updatedDate: faker.date.past(0.1).toString(),
    updatedByUserId: () => '2d91d36d-618c-5b36-b4b7-986a041bf397'
  }
});
