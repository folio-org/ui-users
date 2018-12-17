import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  email: () => faker.internet.email(),
  phone: () => faker.phone.phoneNumber(),
  mobilePhone: () => faker.phone.phoneNumber(),
  dateOfBirth: () => faker.date.past().toISOString().substring(0, 10),
  preferredContactTypeId: () => '003',
  afterCreate(userPersonal, server) {
    const addresses = server.createList('addresse', 1);
    userPersonal.update('addresses', addresses);
    userPersonal.save();
  }
});
