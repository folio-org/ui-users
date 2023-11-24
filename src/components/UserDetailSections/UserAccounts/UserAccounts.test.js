import { screen } from '@folio/jest-config-stripes/testing-library/react';
import accounts from 'fixtures/account';
import loans from 'fixtures/openLoans';
import renderWithRouter from 'helpers/renderWithRouter';
import UserAccounts from './UserAccounts';

const renderUserAccounts = (props) => renderWithRouter(<UserAccounts {...props} />);

const resources = {
  loansHistory: {
    records: loans,
  },
  feefineactions: {
    records: [{
      typeAction: 'Refunded fully'
    }],
  },
};

const resourcesEmpty = {
  loansHistory: {
    records: [],
  },
  feefineactions: {
    records: [],
  },
};

const onToggleMock = jest.fn();

const props = (emptyData) => {
  return {
    accounts : {
      records: [accounts],
      isPending: !emptyData,
    },
    accordionId: 'UserAccounts',
    expanded: true,
    onToggle: onToggleMock,
    location: {
      search: '',
      path: '/userAccounts'
    },
    match: {
      params: {
        id: ''
      }
    },
    resources: emptyData ? resources : resourcesEmpty,
  };
};

describe('Render UserAccounts component', () => {
  it('Check if List is rendered', () => {
    renderUserAccounts(props(true));
    expect(screen.getAllByText('List Component')[0]).toBeInTheDocument();
    expect(screen.getByText('ui-users.accounts.numOpenAccounts')).toBeInTheDocument();
  });
  it('Check if List is not shown', () => {
    renderUserAccounts(props(false));
    expect(document.querySelector('[id="numOpenAccounts"]')).toBeNull();
  });
  describe('when user is of type dcb', () => {
    it('should not display "Create fee/fine" button', () => {
      const alteredProps = {
        accounts : {
          records: [accounts],
          isPending: false,
        },
        accordionId: 'UserAccounts',
        expanded: true,
        onToggle: onToggleMock,
        location: {
          search: '',
          path: '/userAccounts'
        },
        match: {
          params: {
            id: ''
          }
        },
        resources: {
          ...resources,
          selUser: {
            records: [
              {
                personal: { lastName: 'DcbSystem' },
                type: 'dcb'
              }
            ]
          },
        },
      };
      renderUserAccounts(alteredProps);
      expect(screen.queryByText('Create fee/fine')).toBeNull();
    });
  });
});
