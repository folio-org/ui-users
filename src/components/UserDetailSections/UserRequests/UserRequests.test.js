import { List } from '@folio/stripes/components';
import { screen } from '@folio/jest-config-stripes/testing-library/react';
import '__mock__/stripesComponents.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import UserRequests from './UserRequests';

jest.mock('../../Wrappers', () => ({
  ...jest.requireActual('../../Wrappers'),
  withCustomFields: jest.fn(Component => props => (
    <Component
      {...props}
      showCustomFieldsSection
    />
  )),
}));

const toggleMock = jest.fn();

const renderUserRequests = (props) => renderWithRouter(<UserRequests {...props} />);

const mutator = {
  closedRequestsCount: {
    DELETE: jest.fn(),
    POST: jest.fn(),
    PUT: jest.fn(),
    cancel: jest.fn(),
    GET: jest.fn(),
    reset: jest.fn(),
  },
  openRequestsCount: {
    DELETE: jest.fn(),
    POST: jest.fn(),
    PUT: jest.fn(),
    cancel: jest.fn(),
    GET: jest.fn(),
    reset: jest.fn(),
  },
  userid: {
    update: jest.fn(),
    replace: jest.fn(),
  }
};

const props = (perm) => {
  const hasPerm = typeof perm === 'function'
    ? perm
    : jest.fn().mockReturnValue(perm);

  return {
    customFields: [],
    expanded: true,
    mutator,
    onToggle: toggleMock,
    accordionId: 'requestsSection',
    getPreferredServicePoint: jest.fn(),
    getUserServicePoints: jest.fn(),
    getProxies: jest.fn(),
    getSponsors: jest.fn(),
    match: {
      params: {
        id: '578a8413-dec9-4a70-a2ab-10ec865399f6'
      }
    },
    stripes: {
      connect: (Component) => Component,
      hasPerm,
      hasInterface: jest.fn().mockReturnValue(true),
    },
    patronGroup: {
      desc: 'Staff Member',
      expirationOffsetInDays: 730,
      group: 'staff',
      id: '3684a786-6671-4268-8ed0-9db82ebca60b'
    },
    resources: {
      closedRequestsCount: {
        resource: 'closedRequestsCount',
        isPending: false,
        records: [
          {
            requests: [{
              fulfillmentPreference: 'Hold Shelf',
              id: '9b120742-bd00-43db-9b72-477902f5cec7',
              instance: { title: 'A semantic web primer' },
              instanceId: '5bf370e0-8cca-4d9c-82e4-5170ab2a0a39',
              pickupServicePointId: '3a40852d-49fd-4df2-a1f9-6e2641a6e91f',
              position: 6,
              requestDate: '2022-05-16T07:25:44.000+00:00',
              requestLevel: 'Title',
              requestType: 'Hold',
              requester: { firstName: 'acq-admin', lastName: 'Admin', barcode: '1652666475582496124' },
              requesterId: '578a8413-dec9-4a70-a2ab-10ec865399f6',
              status: 'Open - Not yet filled'
            }],
            totalRecords: 1
          }
        ]
      },
      openRequestsCount: {
        resource: 'openRequestsCount',
        isPending: false,
        records: [
          {
            requests: [{
              fulfillmentPreference: 'Hold Shelf',
              id: '9b120742-bd00-43db-9b72-477902f5cec7',
              instance: { title: 'A semantic web primer' },
              instanceId: '5bf370e0-8cca-4d9c-82e4-5170ab2a0a39',
              pickupServicePointId: '3a40852d-49fd-4df2-a1f9-6e2641a6e91f',
              position: 6,
              requestDate: '2022-05-16T07:25:44.000+00:00',
              requestLevel: 'Title',
              requestType: 'Hold',
              requester: { firstName: 'acq-admin', lastName: 'Admin', barcode: '1652666475582496124' },
              requesterId: '578a8413-dec9-4a70-a2ab-10ec865399f6',
              status: 'Open - Not yet filled'
            }],
            totalRecords: 1
          }
        ]
      },
      userid: {}
    },
    user: {
      active: true,
      barcode: '1652666475582496124',
      createdDate: '2022-05-10T02:00:49.576+00:00',
      departments: [],
      id: '578a8413-dec9-4a70-a2ab-10ec865399f6',
      patronGroup: '3684a786-6671-4268-8ed0-9db82ebca60b',
      personal: { lastName: 'Admin', firstName: 'acq-admin', addresses: [] },
      proxyFor: [],
      type: 'patron',
      updatedDate: '2022-05-10T02:00:49.576+00:00',
      username: 'acq-admin'
    }
  };
};

describe('Render User Requests component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Check if Component is rendered', () => {
    renderUserRequests(props(true));
    expect(screen.getByText('List Component')).toBeInTheDocument();
  });
  it('Sending permissions as false', () => {
    renderUserRequests(props(false));
    expect(screen.queryByText('List Component')).not.toBeInTheDocument();
  });

  describe('when user is of type dcb', () => {
    it('should not display "Create Request" button', () => {
      const alteredProps = (perm) => {
        return {
          ...props(perm),
          user: {
            type: 'dcb'
          },
        };
      };
      renderUserRequests(alteredProps(true));
      expect(screen.queryByText('Create Request')).toBeNull();
    });
  });

  describe('when custom fields are present', () => {
    it('should display "ViewCustomFieldsRecord"', () => {
      renderUserRequests(props(true));

      expect(screen.getByText('ViewCustomFieldsRecord')).toBeInTheDocument();
    });
  });

  it('should reset openRequestsCount and closedRequestsCount on mount', () => {
    renderUserRequests(props(true));

    expect(mutator.openRequestsCount.reset).toHaveBeenCalled();
    expect(mutator.closedRequestsCount.reset).toHaveBeenCalled();
  });

  describe('when user has ui-users.requests.all permission', () => {
    it('should display clickable links to open and closed requests', () => {
      const hasPerm = jest.fn((permission) => permission === 'ui-users.requests.all');

      renderUserRequests(props(hasPerm));

      const listProps = List.mock.calls[0][0];
      const formattedItem = listProps.itemFormatter({
        id: 'clickable-viewopenrequests',
        count: 1,
        formattedMessageId: 'ui-users.requests.numOpenRequests',
        query: { query: 'user-id', filters: 'status.Open' },
      }, 0);

      expect(formattedItem.props.children.props.to).toContain('/requests/?');
    });
  });
});
