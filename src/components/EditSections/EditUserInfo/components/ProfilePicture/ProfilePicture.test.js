import React from 'react';
import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import ProfilePicture from './ProfilePicture';
import { isAValidURL } from '../../../../util';

jest.mock('../../../../util/util', () => ({
  isAValidURL: jest.fn(),
}));

describe('ProfilePicture', () => {
  test('renders profile picture loader when isFetching is true', () => {
    const profilePictureLink = 'https://folio.org/wp-content/uploads/2023/08/folio-site-general-Illustration-social-image-1200.jpg';
    const isFetching = true;
    const profilePictureData = '';
    isAValidURL.mockReturnValue(true);
    render(
      <ProfilePicture
        profilePictureLink={profilePictureLink}
        isFetching={isFetching}
        profilePictureData={profilePictureData}
      />
    );
    const profilePictureLoader = screen.getByTestId('profile-picture-loader');
    expect(profilePictureLoader).toBeInTheDocument();
  });
});
