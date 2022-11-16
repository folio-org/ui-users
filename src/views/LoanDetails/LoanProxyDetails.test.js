import { screen } from '@testing-library/react';
import user from 'fixtures/okapiCurrentUser';

import renderWithRouter from 'helpers/renderWithRouter';
import LoanProxyDetails from './LoanProxyDetails';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const proxyData = {
  type: 'okapi',
  path: 'users/!{id}',
  fetch: false,
  accumulate: 'true',
  throwErrors: false,
};

const showErrorMock = jest.fn();
const renderLoanProxyDetails = (props) => renderWithRouter(<LoanProxyDetails {...props} />);
describe('Render LoanProxyDetails component', () => {
  it('When props ID and proxy ID are same', () => {
    const props = {
      id: 'testId',
      resources: {
        proxy: {
          records: [{ id: 'testId' }]
        }
      },
      mutator: {
        proxy: {
          GET: jest.fn().mockResolvedValue(proxyData),
        },
      },
      showErrorCallout: showErrorMock,
      user
    };
    renderLoanProxyDetails(props);
    expect(screen.getAllByText('ui-users.loans.details.proxyBorrower')).toBeTruthy();
  });

  it('When Proxies id is blank', () => {
    const props = {
      id: 'testId',
      resources: {
        proxy: {
          records: [{ id: '' }]
        }
      },
      mutator: {
        proxy: {
          GET: jest.fn().mockResolvedValue(proxyData),
        },
      },
      showErrorCallout: showErrorMock,
      user
    };
    renderLoanProxyDetails(props);
    expect(screen.getAllByText('ui-users.user.unknown')).toBeTruthy();
  });

  it('When Props id is blank', () => {
    const props = {
      id: '',
      resources: {
        proxy: {
          records: [{ id: 'testId' }]
        }
      },
      mutator: {
        proxy: {
          GET: jest.fn().mockResolvedValue(proxyData),
        },
      },
      showErrorCallout: showErrorMock,
      user
    };
    renderLoanProxyDetails(props);
    expect(screen.getAllByText('-')).toBeTruthy();
  });
});
