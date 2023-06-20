import React from 'react';
import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import PropTypes from 'prop-types';

import '__mock__/currencyData.mock';
import loans from 'fixtures/openLoans';

import withAddInfo from './withAddInfo';

const LoanActionDialogMock = ({ open, onClose }) => (
  open && <button type="button" data-testid="close-dialog" onClick={() => onClose()}>close</button>
);
LoanActionDialogMock.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};

jest.mock('../LoanActionDialog', () => LoanActionDialogMock);

const AddInfoButton = ({ addInfo }) => (
  <button type="button" data-testid="open-dialog" onClick={() => addInfo(loans[0], 1, 'patron')}>add info</button>
);

AddInfoButton.propTypes = {
  addInfo: PropTypes.func,
};

const WrappedComponent = withAddInfo(AddInfoButton);
const renderWithAddInfo = () => render(<WrappedComponent />);

afterEach(() => jest.clearAllMocks());

describe('withAddInfo', () => {
  test('render wrapped component', () => {
    renderWithAddInfo();
    expect(screen.getByTestId('open-dialog')).toBeInTheDocument();
  });

  describe('opening add info dialog', () => {
    beforeEach(() => {
      renderWithAddInfo();
      userEvent.click(screen.getByTestId('open-dialog'));
    });

    test('open add info dialog', () => {
      expect(screen.getByTestId('close-dialog')).toBeInTheDocument();
    });

    describe('closing add info dialog', () => {
      beforeEach(() => {
        userEvent.click(screen.getByTestId('close-dialog'));
      });

      test('close add info dialog', () => {
        expect(screen.queryByTestId('close-dialog')).not.toBeInTheDocument();
      });
    });
  });
});
