import React from 'react';
import { Img } from 'react-image';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import ProfilePicture from './ProfilePicture';
import { isAValidURL } from '../util';
import profilePicData from '../../../test/jest/fixtures/profilePicture';
import { useProfilePicture } from '../../hooks';

jest.mock('../util/util', () => ({
  isAValidURL: jest.fn(),
}));

jest.mock('react-image', () => ({
  Img: jest.fn(() => null),
}));

jest.mock('../../hooks', () => ({
  useProfilePicture: jest.fn(),
}));

describe('ProfilePicture', () => {
  test('renders profile picture loader when isFetching is true', () => {
    useProfilePicture.mockClear().mockReturnValue({ profilePictureData: profilePicData.profile_picture_blob, isFetching: true });
    const profilePictureLink = '';
    isAValidURL.mockReturnValue(true);
    render(
      <ProfilePicture
        profilePictureLink={profilePictureLink}
      />
    );
    const profilePictureLoader = screen.getByTestId('profile-picture-loader');
    expect(profilePictureLoader).toBeInTheDocument();
  });
  test('renders and displays profile picture', () => {
    const profilePictureLink = 'https://folio.org/wp-content/uploads/2023/08/folio-site-general-Illustration-social-image-1200.jpg';
    useProfilePicture.mockClear().mockReturnValue({ isFetching: false });
    isAValidURL.mockReturnValue(true);
    render(
      <ProfilePicture
        profilePictureLink={profilePictureLink}
      />
    );
    expect(Img).toHaveBeenCalled();
  });
  test('renders profile picture with correct props', () => {
    const profilePictureLink = 'https://folio.org/wp-content/uploads/2023/08/folio-site-general-Illustration-social-image-1200.jpg';
    useProfilePicture.mockClear().mockReturnValue({ isFetching: false });
    isAValidURL.mockReturnValue(true);
    render(
      <ProfilePicture
        profilePictureLink={profilePictureLink}
      />
    );
    expect(Img).toHaveBeenCalled();
    const renderedProfileImg = Img.mock.calls[0][0];
    expect(renderedProfileImg.alt).toBe('ui-users.information.profilePicture');
    expect(renderedProfileImg.src).toBe(profilePictureLink);
  });
});
