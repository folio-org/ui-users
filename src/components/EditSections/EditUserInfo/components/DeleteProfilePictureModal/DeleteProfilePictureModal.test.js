import { screen, render } from '@folio/jest-config-stripes/testing-library/react';

import DeleteProfilePictureModal from './DeleteProfilePictureModal';

describe('DeleteProfilePictureModal', () => {
  const props = {
    open: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    personal: {
      lastName: 'psych',
      firstName: 'rick',
    },
  };
  beforeEach(() => {
    render(<DeleteProfilePictureModal {...props} />);
  });

  it('should render confirmation modal', () => {
    expect(screen.getByText('ui-users.information.profilePicture.delete.modal.heading')).toBeInTheDocument();
  });

  it('should render confirmation modal message', () => {
    expect(screen.getByText('ui-users.information.profilePicture.delete.modal.message')).toBeInTheDocument();
  });
});
