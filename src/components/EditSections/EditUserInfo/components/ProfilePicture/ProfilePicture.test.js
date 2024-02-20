import {
  render,
  screen,
  fireEvent,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import profilePicData from 'fixtures/profilePicture';

import ProfilePicture from './ProfilePicture';
import { useProfilePicture } from '../../../../../hooks';

jest.unmock('@folio/stripes/components');

jest.mock('../../../../../hooks', () => ({
  useProfilePicture: jest.fn(),
}));

const defaultProps = {
  profilePictureId: 'https://folio.org/wp-content/uploads/2023/08/folio-site-general-Illustration-social-image-1200.jpg',
  form: {
    change: jest.fn(),
    getState: jest.fn(() => ({ pristine: false })),
  },
  personal: {
    lastName: 'lastName',
    firstName: 'firstName',
  },
};

const renderProfilePicture = (props) => render(<ProfilePicture {...props} />);

describe('Profile Picture', () => {
  describe('when profile picture is a url', () => {
    beforeEach(() => {
      useProfilePicture.mockClear().mockReturnValue({ profilePictureData: profilePicData.profile_picture_blob, isFetching: false });
      renderProfilePicture(defaultProps);
    });

    it('should display Profile picture Loader while fetching profile picture', () => {
      useProfilePicture.mockClear().mockReturnValue({ profilePictureData: profilePicData.profile_picture_blob, isFetching: true });
      renderProfilePicture(defaultProps);
      const profilePictureLoader = screen.getByTestId('profile-picture-loader').querySelector('.spinner');
      expect(profilePictureLoader).toBeInTheDocument();
    });

    it('should display Profile picture', () => {
      expect(screen.getByAltText('ui-users.information.profilePicture')).toBeInTheDocument();
    });

    it('Image to be displayed with correct src', () => {
      const image = screen.getByTestId('profile-picture');
      expect(image.src).toContain('https://folio.org/wp-content/uploads/2023/08/folio-site-general-Illustration-social-image-1200.jpg');
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

    it('should render external url link modal', async () => {
      const updateButton = screen.getByTestId('updateProfilePictureDropdown');
      await userEvent.click(updateButton);
      const externalURLButton = screen.getByTestId('externalURL');
      await userEvent.click(externalURLButton);

      expect(screen.getByText('ui-users.information.profilePicture.externalLink.modal.externalURL')).toBeInTheDocument();
    });

    it('should call save handler', async () => {
      const updateButton = screen.getByTestId('updateProfilePictureDropdown');
      await userEvent.click(updateButton);
      const externalURLButton = screen.getByTestId('externalURL');
      await userEvent.click(externalURLButton);
      const saveButton = screen.getByRole('button', { name: 'ui-users.save' });
      const inputElement = screen.getByLabelText('ui-users.information.profilePicture.externalLink.modal.externalURL');

      fireEvent.change(inputElement, { target: { value: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/FOLIO_400x400.jpg' } });
      await userEvent.click(saveButton);
      const image = screen.getByTestId('profile-picture');
      expect(expect(image.src).toContain('https://upload.wikimedia.org/wikipedia/commons/e/e2/FOLIO_400x400.jpg'));
    });

    it('should render delete confirmation modal', async () => {
      const updateButton = screen.getByTestId('updateProfilePictureDropdown');
      await userEvent.click(updateButton);
      const deleteButton = screen.getByTestId('delete');
      await userEvent.click(deleteButton);

      expect(screen.getByText('ui-users.information.profilePicture.delete.modal.heading')).toBeInTheDocument();
    });
  });

  describe('when profile picture is a uuid ', () => {
    beforeEach(() => {
      useProfilePicture.mockClear().mockReturnValue({ profilePictureData: profilePicData.profile_picture_blob, isFetching: false });
      renderProfilePicture({ ...defaultProps, profilePictureId: 'cdc053ff-f88e-445c-878f-650472bd52e6' });
    });

    it('should display Profile picture', () => {
      expect(screen.getByTestId('profile-picture')).toBeInTheDocument();
    });
  });
});
