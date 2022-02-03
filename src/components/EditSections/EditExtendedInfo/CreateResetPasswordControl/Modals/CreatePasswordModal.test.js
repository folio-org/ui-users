import React from 'react';
import { screen } from '@testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';
import CreatePasswordModalBody from './CreatePasswordModal';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';

jest.unmock('@folio/stripes/components');

const renderCreatePasswordModal = (props) => renderWithRouter(<CreatePasswordModalBody {...props} />);

const propData = {
  email: 'testemail@www.com',
  isOpen: true,
  modalHeader: 'ModalHeader',
  onClose: jest.fn(),
  link: '/Users/Test',
};

describe('Create Password Modal component', () => {
  beforeEach(async () => {
    renderCreatePasswordModal(propData);
  });
  it('if it renders', () => {
    expect(screen.getByText('testemail@www.com')).toBeInTheDocument();
  });
});
