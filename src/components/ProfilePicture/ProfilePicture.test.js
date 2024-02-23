import React from 'react';
import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import { Img } from 'react-image';
import ProfilePicture from './ProfilePicture';
import { isAValidURL } from '../util';

jest.mock('../util/util', () => ({
  isAValidURL: jest.fn(),
}));

jest.mock('react-image', () => ({
  Img: jest.fn(() => null),
}));

describe('ProfilePicture', () => {
  test('renders profile picture loader when isFetching is true', () => {
    const profilePictureLink = '';
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
  test('renders and displays profile picture', () => {
    const profilePictureLink = 'https://folio.org/wp-content/uploads/2023/08/folio-site-general-Illustration-social-image-1200.jpg';
    const isFetching = false;
    const profilePictureData = 'profile-pic-data';
    isAValidURL.mockReturnValue(true);
    render(
      <ProfilePicture
        profilePictureLink={profilePictureLink}
        isFetching={isFetching}
        profilePictureData={profilePictureData}
      />
    );
    expect(Img).toHaveBeenCalled();
    const renderedProfileImg = Img.mock.calls[0][0];
    expect(renderedProfileImg.alt).toBe('ui-users.information.profilePicture');
    expect(renderedProfileImg.src).toBe(profilePictureLink);
  });
});
