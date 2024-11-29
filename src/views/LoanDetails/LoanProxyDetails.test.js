import { screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
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
const props = (propID, proxyID) => {
  return {
    id: propID,
    resources: {
      proxy: {
        records: [{ id: proxyID }]
      }
    },
    mutator: {
      proxy: {
        GET: jest.fn().mockResolvedValueOnce(proxyData),
        reset: jest.fn(),
      },
    },
    showErrorCallout: showErrorMock,
    user
  };
};

const renderLoanProxyDetails = (props1) => renderWithRouter(<LoanProxyDetails {...props1} />);

describe('Render LoanProxyDetails component', () => {
  it('When props ID and proxy ID are same', () => {
    renderLoanProxyDetails(props('testId', 'testId'));
    expect(screen.getAllByText('ui-users.loans.details.proxyBorrower')).toBeTruthy();
  });

  it('When Proxies id is blank', () => {
    renderLoanProxyDetails(props('testId', ''));
    expect(screen.getAllByText('ui-users.user.unknown')).toBeTruthy();
  });

  it('When Props id is blank', () => {
    renderLoanProxyDetails(props('', 'testId'));
    expect(screen.getAllByText('-')).toBeTruthy();
  });

  it('When execption is catched', async () => {
    const newprops = {
      id: 'test',
      resources: {
        proxy: null
      },
      mutator: {
        proxy: {
          GET: jest.fn().mockRejectedValueOnce(),
        },
      },
      showErrorCallout: showErrorMock,
    };
    renderLoanProxyDetails(newprops);
    await waitFor(() => {
      expect(showErrorMock).toHaveBeenCalled();
    });
  });
});
