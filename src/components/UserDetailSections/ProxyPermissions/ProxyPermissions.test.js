import { screen } from '@testing-library/react';
import user from 'fixtures/okapiCurrentUser';

import renderWithRouter from 'helpers/renderWithRouter';
import ProxyPermissions from './ProxyPermissions';

jest.unmock('@folio/stripes/components');

const renderProxyPermissions = (props) => renderWithRouter(<ProxyPermissions {...props} />);

const STRIPES = {
  config: {},
  hasPerm: jest.fn().mockReturnValue(true),
};


describe('render ProxyPermissions component', () => {
  it('Component must be rendered', () => {
    const props = {
      accordionId: 'assignedPermissions',
      expanded: true,
      onToggle: jest.fn(),
      proxies: [
        {
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
      ],
      sponsors: [
        {
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
      ],
      stripes: STRIPES,
      user,
    };
    renderProxyPermissions(props);
    expect(renderProxyPermissions(props)).toBeTruthy();
    expect(screen.getAllByText('ui-users.proxy.notificationsTo')).toBeTruthy();
  });
  it('No proxies/sponsor check', () => {
    const props = {
      accordionId: 'assignedPermissions',
      expanded: true,
      onToggle: jest.fn(),
      proxies: [],
      sponsors: [],
      stripes: STRIPES,
      user,
    };
    renderProxyPermissions(props);
    expect(screen.getByText('ui-users.permissions.noProxiesFound')).toBeTruthy();
    expect(screen.getByText('ui-users.permissions.noSponsorsFound')).toBeTruthy();
  });
});
