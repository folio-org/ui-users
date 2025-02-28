import { fireEvent, screen } from '@folio/jest-config-stripes/testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';
import PatronBlockModalWithOverrideModal from './PatronBlockModalWithOverrideModal';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';

jest.unmock('@folio/stripes/components');

const renderPatronBlockModalWithOverrideModal = (props) => renderWithRouter(<PatronBlockModalWithOverrideModal {...props} />);

const props = {
  onRenew: jest.fn(),
  onOpenPatronBlockedModal: jest.fn(),
  onClosePatronBlockedModal: jest.fn(),
  patronBlockedModalOpen: true,
  patronBlocks: [],
  viewUserPath: '/Users/Test'
};

describe('UserPermissions component', () => {
  beforeEach(() => {
    renderPatronBlockModalWithOverrideModal(props);
  });

  it('Checking patronBlock Modal', () => {
    expect(renderPatronBlockModalWithOverrideModal(props)).toBeTruthy();
  });

  it('Checking patronBlock override Modal', () => {
    fireEvent.click(screen.getByText('ui-users.blocks.overrideButton'));
    expect(screen.getByText('ui-users.blocks.modal.overridePatronBlock.header')).toBeTruthy();
  });

  it('Adding comment and saving', () => {
    fireEvent.click(screen.getByText('ui-users.blocks.overrideButton'));
    fireEvent.change(
      screen.getByLabelText('ui-users.blocks.modal.comment', { exact: false }),
      { target: { value: 'test' } }
    );
    fireEvent.click(document.querySelector('[data-test-override-patron-block-modal-save="true"]'));
    expect(props.onRenew).toHaveBeenCalledWith('test');
  });
});
