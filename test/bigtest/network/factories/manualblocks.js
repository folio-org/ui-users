import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  id: () => faker.random.uuid(),
  userId: '630824a0-a8ad-49f3-b5e2-3f2fe6ef5916',
  type: 'Manual',
  desc: 'Invalid email and mailing addresses.',
  staffInformation: 'Last 3 have bounced back and the letter we sent was returned to us.',
  patronMessage: 'Please contact the Main Library to update your contact information.',
  expirationDate: '2019-10-23T00:00:00Z',
  borrowing: true,
  renewals: true,
  requests: true,
  metadata: {
    createdDate: '2019-07-25T00:00:00Z',
    createdByUserId: () => '2d91d36d-618c-5b36-b4b7-986a041bf397',
    updatedDate: '2019-07-25T00:00:00Z',
    updatedByUserId: () => '2d91d36d-618c-5b36-b4b7-986a041bf397'
  }
});
