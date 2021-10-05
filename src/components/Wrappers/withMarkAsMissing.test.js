import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropTypes from 'prop-types';

import '__mock__/currencyData.mock';
import loans from 'fixtures/openLoans';

import withMarkAsMissing from './withMarkAsMissing';

const LoanActionDialogMock = ({ open, onClose }) => (
  open && <button type="button" data-testid="close-dialog" onClick={() => onClose()}>close</button>
);
LoanActionDialogMock.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};

jest.mock('../LoanActionDialog', () => LoanActionDialogMock);

const MarkAsMissingButton = ({ markAsMissing }) => (
  <button type="button" data-testid="open-dialog" onClick={() => markAsMissing(loans[0], 1)}>mark</button>
);

MarkAsMissingButton.propTypes = {
  markAsMissing: PropTypes.func,
};

const WrappedComponent = withMarkAsMissing(MarkAsMissingButton);
const renderWithMarkAsMissing = () => render(<WrappedComponent />);

afterEach(() => jest.clearAllMocks());

describe('withMarkAsMissing', () => {
  test('render wrapped component', () => {
    renderWithMarkAsMissing();
    expect(screen.getByTestId('open-dialog')).toBeInTheDocument();
  });

  describe('opening mark as missing dialog', () => {
    beforeEach(() => {
      renderWithMarkAsMissing();
      userEvent.click(screen.getByTestId('open-dialog'));
    });

    test('open mark as missing dialog', () => {
      expect(screen.getByTestId('close-dialog')).toBeInTheDocument();
    });

    describe('closing mark as missing dialog', () => {
      beforeEach(() => {
        userEvent.click(screen.getByTestId('close-dialog'));
      });

      test('close mark as missing dialog', () => {
        expect(screen.queryByTestId('close-dialog')).not.toBeInTheDocument();
      });
    });
  });
});
