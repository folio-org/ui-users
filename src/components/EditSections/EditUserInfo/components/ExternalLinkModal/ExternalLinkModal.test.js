import {
  screen,
  render,
  fireEvent
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import { TextField } from '@folio/stripes/components';

import '../../../../../../test/jest/__mock__';

import ExternalLinkModal from './ExternalLinkModal';

TextField.mockImplementation(jest.fn((props) => (
  <div>
    <label htmlFor={props.name}>{props.label}</label>
    <input
      {...props}
    />
  </div>
)));

const renderExternalLinkModal = (props) => render(<ExternalLinkModal {...props} />);

describe('ExternalLinkModal', () => {
  const props = {
    onOpen: jest.fn(),
    onClose: jest.fn(),
    onSave: jest.fn(),
    profilePictureLink: 'profilePictureLink',
  };

  beforeEach(() => {
    renderExternalLinkModal(props);
  });

  it('should have modal title - Update profile picture', () => {
    expect(screen.getByText('ui-users.information.profilePicture.externalLink.modal.updateProfilePicture')).toBeInTheDocument();
  });
  it('should display textfield', () => {
    expect(screen.getByText('ui-users.information.profilePicture.externalLink.modal.externalURL')).toBeInTheDocument();
  });
  it('should call onSave', async () => {
    const saveButton = screen.getByRole('button', { name: 'ui-users.save' });
    const inputElement = screen.getByLabelText('ui-users.information.profilePicture.externalLink.modal.externalURL');

    fireEvent.change(inputElement, { target: { value: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/FOLIO_400x400.jpg' } });
    await userEvent.click(saveButton);

    expect(props.onSave).toHaveBeenCalled();
  });
  it('should call onClose', async () => {
    const cancelButton = screen.getByRole('button', { name: 'stripes-core.button.cancel' });
    await userEvent.click(cancelButton);

    expect(props.onClose).toHaveBeenCalled();
  });
});
