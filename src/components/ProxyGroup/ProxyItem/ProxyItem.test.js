import { screen } from '@testing-library/react';
import user from 'fixtures/okapiCurrentUser';

import renderWithRouter from 'helpers/renderWithRouter';
import ProxyItem from './ProxyItem';

jest.unmock('@folio/stripes/components');

const renderProxyItem = (props) => renderWithRouter(<ProxyItem {...props} />);
describe('Render ProxyItem component', () => {
  it('When Proxies are given with expiration date', () => {
    const props = {
      record: {
        proxy : {
          id: 'test',
          name: 'test',
          expirationDate: '2021-11-23T09:53:48.906+00:00',
          metadata: {
            createdDate: '2021-11-23T09:53:48.906+00:00',
            createdByUserId: '3507800c-eda8-53a5-b466-c7ac37034a27',
            updatedDate: '2021-11-23T09:53:48.906+00:00',
            updatedByUserId: '3507800c-eda8-53a5-b466-c7ac37034a27'
          }
        },
        user,
      }
    };
    renderProxyItem(props);
    expect(screen.getAllByText('ui-users.proxy.notificationsTo')).toBeTruthy();
    expect(screen.getAllByText('ui-users.proxy.relationshipStatus')).toBeTruthy();
    expect(screen.getByText('ui-users.expirationDate')).toBeInTheDocument();
  });
  it('When Proxies are given without expiration date', () => {
    const props = {
      record: {
        proxy : {
          id: 'test',
          name: 'test',
          metadata: {
            createdDate: '2021-11-23T09:53:48.906+00:00',
            createdByUserId: '3507800c-eda8-53a5-b466-c7ac37034a27',
            updatedDate: '2021-11-23T09:53:48.906+00:00',
            updatedByUserId: '3507800c-eda8-53a5-b466-c7ac37034a27'
          }
        },
        user,
      }
    };
    renderProxyItem(props);
    expect(screen.getAllByText('ui-users.proxy.requestForSponsor')).toBeTruthy();
  });
});
