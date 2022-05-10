import { screen } from '@testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';

import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import okapiOpenLoan from 'fixtures/openLoan';

import ActionsDropdown from './ActionsDropdown';

jest.mock('../../../../util', () => {
  return {
    ...jest.requireActual('../../../../util'),
    checkUserActive: jest.fn().mockReturnValue(true),
  };
});

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const mockHandleOptionsChange = jest.fn();

const renderActionsDropdown = (props) => renderWithRouter(<ActionsDropdown {...props} />);

const props = {
  stripes: { hasPerm: jest.fn() },
  loan: okapiOpenLoan,
  requestQueue: false,
  itemRequestCount: 0,
  handleOptionsChange: mockHandleOptionsChange,
  disableFeeFineDetails: false,
  match: { params: {} },
  intl: { formatMessage : jest.fn() },
  user: okapiCurrentUser,
};

describe('ActoinsDropdown component', () => {
  it('renders properly', () => {
    renderActionsDropdown(props);
    expect(screen.getByTestId('actions-dropdown-test-id')).toBeInTheDocument();
  });
});
