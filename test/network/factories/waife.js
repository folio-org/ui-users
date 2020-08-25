import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({

  id: () => faker.random.uuid(),
  nameReason : (i) => 'First time offender' + i,
  description : (i) => 'Penalty abatement' + i,
  metadata : {
    createdDate: faker.date.past(0.1, faker.date.past(0.1)).toString(),
    createdByUserId: () => faker.random.uuid(),
    updatedDate: faker.date.past(0.1, faker.date.past(0.1)).toString(),
    updatedByUserId: () => faker.random.uuid()
  },
});
