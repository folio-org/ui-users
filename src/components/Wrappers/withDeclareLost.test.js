import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropTypes from 'prop-types';

import '__mock__/currencyData.mock';
import loans from 'fixtures/openLoans';

import withDeclareLost from './withDeclareLost';

const LoanActionDialogMock = ({ open, onClose, toggleButton }) => (
  open && (
  <>
    <button type="button" data-testid="close-dialog" onClick={() => onClose()}>close</button>
    <button type="button" data-testid="disable-dialog" onClick={() => toggleButton(true)}>Disable</button>
  </>)
);
LoanActionDialogMock.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  toggleButton: PropTypes.func
};

jest.mock('../LoanActionDialog', () => LoanActionDialogMock);

const DeclareLost = ({ declareLost, declarationInProgress, toggleButton }) => (
  <>
    <button type="button" data-testid="enable" onClick={() => toggleButton(false)}>Enable</button>
    { !declarationInProgress ?
      <button type="button" data-testid="declareLost" onClick={() => declareLost(loans[0], 1)}>Declaration</button> : ''}
  </>
);

DeclareLost.propTypes = {
  toggleButton: PropTypes.func,
  declareLost: PropTypes.func,
  declarationInProgress: PropTypes.bool,
};

const WrappedComponent = withDeclareLost(DeclareLost);
const renderWithDeclareLost = () => render(<WrappedComponent />);

afterEach(() => jest.clearAllMocks());

describe('withDeclareLost', () => {
  test('render wrapped component', () => {
    renderWithDeclareLost();
    expect(screen.getByTestId('enable')).toBeInTheDocument();
  });
  test('Test enable button functionality', () => {
    renderWithDeclareLost();
    userEvent.click(screen.getByTestId('enable'));
    expect(screen.getByTestId('declareLost')).toBeInTheDocument();
  });
  test('Test Declare Lost button functionality', () => {
    renderWithDeclareLost();
    userEvent.click(screen.getByTestId('enable'));
    userEvent.click(screen.getByTestId('declareLost'));
    expect(screen.getByTestId('close-dialog')).toBeInTheDocument();
  });
  test('Close Dialog Functionality', () => {
    renderWithDeclareLost();
    userEvent.click(screen.getByTestId('enable'));
    userEvent.click(screen.getByTestId('declareLost'));
    userEvent.click(screen.getByTestId('close-dialog'));
    expect(screen.queryByTestId('close-dialog')).not.toBeInTheDocument();
  });
  test('Disable Dialog Functionality', () => {
    renderWithDeclareLost();
    userEvent.click(screen.getByTestId('enable'));
    userEvent.click(screen.getByTestId('declareLost'));
    userEvent.click(screen.getByTestId('disable-dialog'));
    expect(screen.queryByTestId('declareLost')).not.toBeInTheDocument();
  });
});
