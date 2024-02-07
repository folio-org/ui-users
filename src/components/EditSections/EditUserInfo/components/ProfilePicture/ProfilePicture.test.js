import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import profilePicData from 'fixtures/profilePicture';

import ProfilePicture from './ProfilePicture';
import { useProfilePicture } from '../../../../../hooks';

jest.unmock('@folio/stripes/components');

jest.mock('../../../../../hooks', () => ({
  useProfilePicture: jest.fn(),
}));

const props = {
  label: 'Profile picture',
  profilePictureLink: 'profilePictureLink'
};

describe('Profile Picture', () => {
  beforeEach(() => {
    useProfilePicture.mockClear().mockReturnValue(profilePicData.profile_picture_blob);
    render(<ProfilePicture {...props} />);
  });

  it('should display Profile picture', () => {
    expect(screen.getByTestId('profile-picture')).toBeInTheDocument();
  });

  it('Image to be displayed with correct src', () => {
    const image = screen.getByTestId('profile-picture');
    expect(image.src).toContain('profilePictureLink');
  });

  it('Update button to be displayed', () => {
    expect(screen.getByTestId('updateProfilePictureDropdown')).toBeInTheDocument();
  });

  it('Local file button to be displayed', async () => {
    const updateButton = screen.getByTestId('updateProfilePictureDropdown');
    await userEvent.click(updateButton);

    expect(screen.getByText('Icon (profile)')).toBeInTheDocument();
  });

  it('External link button to be displayed', async () => {
    const updateButton = screen.getByTestId('updateProfilePictureDropdown');
    await userEvent.click(updateButton);

    expect(screen.getByText('Icon (external-link)')).toBeInTheDocument();
  });

  it('Delete link button to be displayed', async () => {
    const updateButton = screen.getByTestId('updateProfilePictureDropdown');
    await userEvent.click(updateButton);

    expect(screen.getByText('Icon (trash)')).toBeInTheDocument();
  });
});
