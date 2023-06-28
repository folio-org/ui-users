import user from 'fixtures/okapiCurrentUser';
import getProxySponsorWarning from './getProxySponsorWarning';

describe('Proxy Sponsor component', () => {
  it('getProxySponsorWarning', async () => {
    const values = {
      proxies: [
        {
          proxy : {
            id: 'test',
            name: 'test',
            expirationDate: '2022-05-30T03:22:53.897+00:00',
            metadata: {
              createdDate: '2021-11-23T09:53:48.906+00:00',
              createdByUserId: '3507800c-eda8-53a5-b466-c7ac37034a27',
              updatedDate: '2021-11-23T09:53:48.906+00:00',
              updatedByUserId: '3507800c-eda8-53a5-b466-c7ac37034a27'
            }
          },
          user,
        }
      ],
      expirationDate: '2022-05-30T03:22:53.897+00:00',
    };

    const data = getProxySponsorWarning(values, 'proxies', 0);
    expect(data).toBeTruthy();
  });
});
