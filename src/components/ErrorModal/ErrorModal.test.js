import {
  screen,
  render,
  fireEvent,
} from '@testing-library/react';

import ErrorModal from './ErrorModal';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const renderErrorModal = (props) => render(<ErrorModal {...props} />);
const testIds = {
  confirmButton: 'confirmButton',
  errorModal: 'errorModal',
};
const label = 'Test Error Label';
const message = 'Test Error Message';
const onClose = jest.fn();
const propData = {
  open: true,
  label,
  message,
  onClose,
};

describe('Error Modal component', () => {
  beforeEach(() => {
    renderErrorModal(propData);
  });

  it('should render modal', () => {
    expect(screen.getByTestId(testIds.errorModal)).toBeInTheDocument();
  });

  it('should render label', () => {
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('should render message', () => {
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('should render default button', () => {
    expect(screen.getByTestId(testIds.confirmButton)).toBeInTheDocument();
  });

  it('should call onClose', () => {
    fireEvent.click(screen.getByTestId(testIds.confirmButton));

    expect(onClose).toHaveBeenCalled();
  });

  describe('Error modal with confirm button text', () => {
    const confirmButtonText = 'confirmButtonText';

    beforeEach(() => {
      renderErrorModal({
        ...propData,
        confirmButtonText,
      });
    });

    it('should render confirm button text', () => {
      expect(screen.getByText(confirmButtonText)).toBeInTheDocument();
    });
  });
});
