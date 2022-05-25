import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import { screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import AddServicePointModal from './AddServicePointModal';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const renderAddServicePointModal = (props) => renderWithRouter(<AddServicePointModal {...props} />);

const onCancelMock = jest.fn();
const onSaveMock = jest.fn();

const propData = {
  onClose: onCancelMock,
  handleSubmit: jest.fn(),
  open: true,
  assignedServicePoints: [{
    'code': 'Online',
    'discoveryDisplayName': 'Online',
    'id': '7c5abc9f-f3d7-4856-b8d7-6712462ca007',
    'locationIds': [],
    'metadata': { 'createdDate': '2021-10-14T03:22:53.897+00:00', 'updatedDate': '2021-10-14T03:22:53.897+00:00' },
    'name': 'Online',
    'pickupLocation': false,
    'shelvingLagTime': 0,
    'staffSlips': []
  }],
  servicePoints: okapiCurrentUser.servicePoints,
  intl: { formatMessage : jest.fn() },
  onSave: onSaveMock,
};

const emptyData = {
  onClose: onCancelMock,
  handleSubmit: jest.fn(),
  open: true,
  assignedServicePoints: [],
  servicePoints: [],
  intl: { formatMessage : jest.fn() },
  onSave: onSaveMock,
};


describe('AddServicePointModal Component', () => {
  describe('With Data', () => {
    beforeEach(() => {
      renderAddServicePointModal(propData);
    });
    afterEach(cleanup);
    it('Check if modal Renders', () => {
      expect(screen.getByText('Online')).toBeInTheDocument();
      expect(screen.getByText('Circ Desk 2')).toBeInTheDocument();
      expect(screen.getByText('Circ Desk 1')).toBeInTheDocument();
    });
    it('Checking Save and Cancel Operation', () => {
      userEvent.click(screen.getByText('ui-users.saveAndClose'));
      expect(onSaveMock).toHaveBeenCalled();
      userEvent.click(screen.getByText('stripes-core.button.cancel'));
      expect(onCancelMock).toHaveBeenCalled();
    });
    it('Checking single service point toggle', () => {
      userEvent.click(document.querySelector('[data-test-sp-modal-checkbox="3a40852d-49fd-4df2-a1f9-6e2641a6e91f"]'));
      expect(document.querySelector('[data-test-sp-modal-checkbox="3a40852d-49fd-4df2-a1f9-6e2641a6e91f"]')).toBeChecked();
    });
    it('Checking if all service points are selected', () => {
      userEvent.click(document.querySelector('[data-test-sp-modal-checkbox="select-all"]'));
      expect(document.querySelector('[data-test-sp-modal-checkbox="3a40852d-49fd-4df2-a1f9-6e2641a6e91f"]')).toBeChecked();
      expect(document.querySelector('[data-test-sp-modal-checkbox="c4c90014-c8c9-4ade-8f24-b5e313319f4b"]')).toBeChecked();
    });
  });
  describe('Without Data', () => {
    beforeEach(() => {
      renderAddServicePointModal(emptyData);
    });
    it('Check if modal Renders', () => {
      // Component Renders
      expect(screen.getByText('ui-users.sp.addServicePoints')).toBeInTheDocument();
      // Data must be empty
      expect(screen.getByText('stripes-components.tableEmpty')).toBeInTheDocument();
    });
  });
});
