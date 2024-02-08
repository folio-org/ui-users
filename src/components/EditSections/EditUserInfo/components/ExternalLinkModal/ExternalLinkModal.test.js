import { screen, render } from '@folio/jest-config-stripes/testing-library/react';
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
    onclose: jest.fn(),
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
});
