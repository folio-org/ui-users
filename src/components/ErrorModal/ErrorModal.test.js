import { screen, render } from '@testing-library/react';

import ErrorModal from './ErrorModal';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const renderErrorModal = (props) => render(<ErrorModal {...props} />);

const propData = {
  open: true,
  onClose: jest.fn(),
  label: 'ErrorModalLabel',
  message: 'Test Error Message',
  id: 'testid123',
};


describe('Error Modal component', () => {
  beforeEach(() => {
    renderErrorModal(propData);
  });
  it('Check if it renders', () => {
    expect(screen.getByText('Test Error Message')).toBeInTheDocument();
  });
  it('Check if footer rendered', () => {
    expect(screen.getByText('ui-users.okay')).toBeInTheDocument();
  });
});
