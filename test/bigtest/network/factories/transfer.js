import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  id: () => faker.random.uuid(),
  accountName: (i) => 'USA Bank' + i,
  desc : (i) => 'Transfer place' + i,
  metadata: {
    createdDate: faker.date.past(0.1, faker.date.past(0.1)).toString(),
    createdByUserId: '1ad737b0-d847-11e6-bf26-cec0c932ce02',
    updatedDate: faker.date.past(0.1).toString(),
    updatedByUserId: '1ad737b0-d847-11e6-bf26-cec0c932ce02',
  },
  ownerId : 'b1cd9b8c-101b-41fc-b4a3-69d75d5a9712',

});
