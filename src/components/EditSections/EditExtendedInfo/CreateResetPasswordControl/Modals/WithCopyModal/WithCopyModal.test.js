import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import WithCopyModal from './WithCopyModal';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';

jest.unmock('@folio/stripes/components');



class MockApp extends React.Component {
  render() {
    return (
      <p>
        Hello from your Mock App
      </p>
    );
  }
}

const RenderModal = WithCopyModal(MockApp);
const renderwithCopyModal = (props) => renderWithRouter(<RenderModal {...props} />);

const propData = {
  isOpen: true,
  modalHeader: 'ModalHeader',
  onClose: jest.fn(),
  link: '/Users/Test',
};

describe('With Copy Modal component', () => {
  beforeEach(async () => {
    renderwithCopyModal(propData);
  });
  it('if it renders', () => {
    expect(screen.getByText('Hello from your Mock App')).toBeInTheDocument();
    expect(screen.getByText('ModalHeader')).toBeInTheDocument();
  });
  it('Checking copy Function', () => {
    document.execCommand = jest.fn();
    userEvent.click(screen.getByText('ui-users.extended.copyLink'));
    expect(screen.getByText('ui-users.extended.copyLink')).toBeDefined();
  });
});
