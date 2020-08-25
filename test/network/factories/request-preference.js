import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  id: (i) => 'requestId' + i,
  userId: (i) => 'userId' + i,
  requestDate: () => faker.date.past().toISOString().substring(0, 10),
  holdShelf: () => true,
  delivery: () => faker.random.arrayElement([true, false]),
  fulfillment: () => faker.random.arrayElement(['Delivery', 'Hold Shelf']),
  defaultServicePointId: '',
  defaultDeliveryAddressTypeId: '',
});
