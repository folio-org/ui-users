import React from 'react';
import { screen } from '@testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';
import ResetPasswordModalBody from './ResetPasswordModal';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';

jest.unmock('@folio/stripes/components');

const renderResetPasswordModal = (props) => renderWithRouter(<ResetPasswordModalBody {...props} />);

const propData = {
  email: 'testemail@www.com',
  name: 'testMockName',
  isOpen: true,
  modalHeader: 'ModalHeader',
  onClose: jest.fn(),
  link: '/Users/Test',
};

describe('Reset Password Modal component', () => {
  beforeEach(async () => {
    renderResetPasswordModal(propData);
  });
  it('if it renders', () => {
    expect(screen.getByText('testemail@www.com')).toBeInTheDocument();
  });
});
