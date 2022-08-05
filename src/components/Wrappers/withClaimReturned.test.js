import React from 'react';
import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropTypes from 'prop-types';

import '__mock__/currencyData.mock';
import loan from 'fixtures/openLoan';

import withClaimReturned from './withClaimReturned';

const props = {
  loan,
  okapi: {
    currentUser: okapiCurrentUser,
  },
  stripes: {
    connect: jest.fn()
  },
  mutator: {
    accounts: {
      GET: jest.fn(),
      PUT: jest.fn()
    },
    feefineactions: {
      GET: jest.fn(),
      POST: jest.fn()
    },
    loanstorage: {
      GET: jest.fn(),
      PUT: jest.fn()
    },
    activeAccount: {
      update: jest.fn()
    },
    activeLoanStorage: {
      update: jest.fn()
    },
  }
};

const LoanActionDialogMock = ({ open, onClose, validateAction }) => (
  open && (
  <>
    <button type="button" data-testid="close-dialog" onClick={() => onClose()}>close</button>
    <button type="button" data-testid="validate-dialog" onClick={() => { validateAction(loan, props); }}>Validate</button>
  </>)
);
LoanActionDialogMock.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  validateAction: PropTypes.func
};

jest.mock('../LoanActionDialog', () => LoanActionDialogMock);

const ClaimReturned = ({ claimReturned }) => (
  <>
    <div>Claim Returned Component</div>
    <button type="button" data-testid="enable" onClick={claimReturned}>Enable</button>
  </>
);
jest.mock('../util/refundTransferClaimReturned', () => {
  return {
    refundTransfers: jest.fn(),
  };
});

ClaimReturned.propTypes = {
  claimReturned: PropTypes.func,
};

const WrappedComponent = withClaimReturned(ClaimReturned);
const renderWithClaimReturned = (extraProps) => render(<WrappedComponent {...extraProps} />);

afterEach(() => jest.clearAllMocks());

describe('withClaimReturned', () => {
  test('render wrapped component', () => {
    renderWithClaimReturned(props);
    expect(screen.getByTestId('enable')).toBeInTheDocument();
  });
  test('Test enable button functionality', () => {
    renderWithClaimReturned(props);
    userEvent.click(screen.getByTestId('enable'));
    expect(screen.getByText('Claim Returned Component')).toBeInTheDocument();
  });
  test('Test Declare Lost button functionality', () => {
    renderWithClaimReturned(props);
    userEvent.click(screen.getByTestId('enable'));
    userEvent.click(screen.getByTestId('validate-dialog'));
    expect(screen.getByText('Validate')).toBeInTheDocument();
  });
  test('Test Declare Lost button functionality', () => {
    renderWithClaimReturned(props);
    userEvent.click(screen.getByTestId('enable'));
    userEvent.click(screen.getByTestId('close-dialog'));
    expect(screen.queryByTestId('close-dialog')).not.toBeInTheDocument();
  });
});
