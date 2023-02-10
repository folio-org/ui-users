import React from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import CopyModal from './CopyModal';

jest.unmock('@folio/stripes/components');

const renderCopyModal = (props) => renderWithRouter(<CopyModal {...props} />);

const mockFunc = jest.fn();
const onCloseMock = jest.fn();

const owner = [
  {
    id: 'test-1',
    metadata: {
      createdByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      createdDate: '2021-12-27T12:08:53.639+00:00',
      updatedByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      updatedDate: '2021-12-27T12:09:22.973+00:00',
    },
    owner: 'test-1',
    servicePointOwner: [
      {
        label: 'Circ Desk 2',
        value: 'c4c90014-c8c9-4ade-8f24-b5e313319f4b',
      }
    ]
  },
  {
    id: 'test-2',
    metadata: {
      createdByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      createdDate: '2021-12-27T12:08:53.639+00:00',
      updatedByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      updatedDate: '2021-12-27T12:09:22.973+00:00',
    },
    owner: 'test-2',
    servicePointOwner: []
  }
];

const propData = {
  ownerList: owner,
  onCloseModal: onCloseMock,
  openModal: true,
  onCopyFeeFines: mockFunc,
};

describe('Copy Modal component', () => {
  beforeEach(async () => {
    renderCopyModal(propData);
  });
  it('Component must be rendered', () => {
    expect(screen.getByText('ui-users.feefines.modal.title')).toBeInTheDocument();
  });
  it('On Submit modal', () => {
    userEvent.selectOptions(screen.getByRole('combobox'), ['test-2']);
    userEvent.click(document.querySelector('[id="yes"]'));
    userEvent.click(screen.getByText('ui-users.feefines.modal.submit'));
    expect(mockFunc).toHaveBeenCalled();
  });
  it('On cancel modal', () => {
    userEvent.click(screen.getByText('ui-users.feefines.modal.cancel'));
    expect(onCloseMock).toHaveBeenCalled();
  });
});
