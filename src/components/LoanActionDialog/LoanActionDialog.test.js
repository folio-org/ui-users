import { screen } from '@testing-library/react';
import PropTypes from 'prop-types';
import '__mock__/stripesComponents.mock';
import loan from 'fixtures/openLoan';
import userEvent from '@testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import LoanActionDialog from './LoanActionDialog';



const ModalContentMock = ({ loanAction, itemRequestCount, validateAction, handleError }) => {
  return (
    <>
      <div>{loanAction}-{itemRequestCount}</div>
      <button type="button" data-testid="close-dialog" onClick={() => handleError('No fee/fine owner found for item\'s permanent location')}>handleError</button>
      <button type="button" data-testid="close-dialog" onClick={() => validateAction()}>close</button>
    </>);
};
ModalContentMock.propTypes = {
  loanAction: PropTypes.string,
  itemRequestCount: PropTypes.number,
  validateAction: PropTypes.func,
  handleError: PropTypes.func,
};

jest.mock('../ModalContent', () => ModalContentMock);


const renderLoanActionDialog = (props) => renderWithRouter(<LoanActionDialog {...props} />);

const props = () => {
  return {
    onClose: jest.fn(),
    open: true,
    loan,
    loanAction: 'claimReturned',
    modalLabel: <div>Test Modal Label</div>,
    validateAction: jest.fn(),
    disableButton: jest.fn(),
    itemRequestCount: 0,
  };
};

describe('Render LoanActionDialog component', () => {
  it('Check if Component is rendered', () => {
    renderLoanActionDialog(props());
    expect(screen.getByText('Test Modal Label')).toBeInTheDocument();
  });
  it('Check if handle Error is called', () => {
    renderLoanActionDialog(props());
    userEvent.click(screen.getByText('handleError'));
    expect(screen.getByText('ui-users.feefines.errors.notBilledTitle')).toBeInTheDocument();
  });
  it('Check if Close error clears the error', () => {
    renderLoanActionDialog(props());
    userEvent.click(screen.getByText('handleError'));
    userEvent.click(screen.getByText('ui-users.blocks.closeButton'));
  });
});
