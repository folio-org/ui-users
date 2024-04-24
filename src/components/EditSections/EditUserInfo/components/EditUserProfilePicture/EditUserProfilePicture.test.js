import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { Img } from 'react-image';
import Compressor from 'compressorjs';

import { useCallout, useStripes } from '@folio/stripes/core';

import profilePicData from 'fixtures/profilePicture';

import { useProfilePicture } from '../../../../../hooks';
import EditUserProfilePicture from './EditUserProfilePicture';
import * as canvasUtilsmodule from './utils/canvasUtils';
import { imageSrc } from './utils/data/imageSrc';

jest.unmock('@folio/stripes/components');

jest.mock('compressorjs');
jest.mock('./utils/canvasUtils', () => ({
  __esModule: true,
  ...jest.requireActual('./utils/canvasUtils'),
  createImage: jest.fn(),
  getRadianAngle: jest.fn(),
  rotateSize: jest.fn(),
  getCroppedImg: jest.fn(),
}));
jest.mock('../../../../../hooks', () => ({
  useProfilePicture: jest.fn(),
}));
jest.mock('react-image', () => ({
  Img: jest.fn(() => null),
}));

jest.mock('../../../../util', () => ({
  isAValidImageUrl: jest.fn(() => true),
  isAValidURL: jest.fn(() => true),
}));

const defaultProps = {
  profilePictureMaxFileSize: 3,
  profilePictureId: 'https://folio.org/wp-content/uploads/2023/08/folio-site-general-Illustration-social-image-1200.jpg',
  form: {
    change: jest.fn(),
    getState: jest.fn(() => ({ pristine: false })),
  },
  personal: {
    lastName: 'lastName',
    firstName: 'firstName',
  },
  stripes: {
    okapi: {
      url: 'https://folio-testing-okapi.dev.folio.org',
      tenant: 'diku',
      okapiReady: true,
    }
  }
};

const renderProfilePicture = (props) => render(<EditUserProfilePicture {...props} />);

describe('Edit User Profile Picture', () => {
  describe('when profile picture is a url', () => {
    const sendCallout = jest.fn();

    beforeEach(() => {
      Compressor.mockReset();
      useProfilePicture.mockClear().mockReturnValue({ profilePictureData: profilePicData.profile_picture_blob });
      sendCallout.mockClear();
      useCallout.mockClear().mockReturnValue({ sendCallout });
      useStripes.mockClear().mockReturnValue({
        okapi: {
          url: 'https://folio-testing-okapi.dev.folio.org',
          tenant: 'diku',
          okapiReady: true,
        },
        hasPerm: jest.fn().mockReturnValue(true),
      });
      global.fetch = jest.fn(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: 'mocked data' }),
      }));
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      global.fetch.mockClear();
      console.error.mockRestore();
      console.warn.mockRestore();
    });

    it('should display Profile picture', () => {
      renderProfilePicture(defaultProps);
      expect(Img).toHaveBeenCalled();
      const renderedProfileImg = Img.mock.calls[0][0];
      expect(renderedProfileImg.alt).toBe('ui-users.information.profilePicture');
    });

    it('Image to be displayed with correct src', () => {
      renderProfilePicture(defaultProps);
      expect(Img).toHaveBeenCalled();
      const renderedProfileImg = Img.mock.calls[0][0];
      expect(renderedProfileImg.src).toContain('https://folio.org/wp-content/uploads/2023/08/folio-site-general-Illustration-social-image-1200.jpg');
    });

    it('should display update button', () => {
      renderProfilePicture(defaultProps);
      expect(screen.getByTestId('updateProfilePictureDropdown')).toBeInTheDocument();
    });

    it('should display Local file button', async () => {
      renderProfilePicture(defaultProps);
      const updateButton = screen.getByTestId('updateProfilePictureDropdown');
      await userEvent.click(updateButton);

      expect(screen.getByText('Icon (profile)')).toBeInTheDocument();
    });

    it('should display External link button', async () => {
      renderProfilePicture(defaultProps);
      const updateButton = screen.getByTestId('updateProfilePictureDropdown');
      await userEvent.click(updateButton);

      expect(screen.getByText('Icon (external-link)')).toBeInTheDocument();
    });

    it('Should display Delete link button', async () => {
      renderProfilePicture(defaultProps);
      const updateButton = screen.getByTestId('updateProfilePictureDropdown');
      await userEvent.click(updateButton);

      expect(screen.getByText('Icon (trash)')).toBeInTheDocument();
    });

    it('should render external url link modal', async () => {
      renderProfilePicture(defaultProps);
      const updateButton = screen.getByTestId('updateProfilePictureDropdown');
      await userEvent.click(updateButton);
      const externalURLButton = screen.getByTestId('externalURL');
      screen.debug(screen.getByTestId('externalURL'));
      await userEvent.click(externalURLButton);

      expect(screen.getByText('ui-users.information.profilePicture.externalLink.modal.externalURL')).toBeInTheDocument();
    });

    it('should call save handler', async () => {
      renderProfilePicture(defaultProps);

      const updateButton = screen.getByTestId('updateProfilePictureDropdown');
      await userEvent.click(updateButton);
      const externalURLButton = screen.getByTestId('externalURL');
      await userEvent.click(externalURLButton);
      const saveButton = screen.getByRole('button', { name: 'ui-users.save' });
      const inputElement = screen.getByLabelText('ui-users.information.profilePicture.externalLink.modal.externalURL');

      fireEvent.change(inputElement, { target: { value: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/FOLIO_400x400.jpg' } });
      await userEvent.click(saveButton);
      expect(Img).toHaveBeenCalled();
      const renderedProfileImg = Img.mock.lastCall[0];
      expect(renderedProfileImg.src).toContain('https://upload.wikimedia.org/wikipedia/commons/e/e2/FOLIO_400x400.jpg');
    });

    it('should invoke local file upload handlers with compression', async () => {
      Compressor.mockImplementationOnce((croppedImage, options) => {
        return options.success(croppedImage);
      });
      const mockCreateObjectURL = jest.fn(() => 'mockedURL');
      URL.createObjectURL = mockCreateObjectURL;

      const mockImage = new Image();
      mockImage.width = 100;
      mockImage.height = 200;
      jest.spyOn(canvasUtilsmodule, 'createImage').mockResolvedValueOnce(mockImage);
      jest.spyOn(canvasUtilsmodule, 'getCroppedImg').mockResolvedValueOnce('mocked-blob-data');

      renderProfilePicture(defaultProps);

      const image = await canvasUtilsmodule.createImage(imageSrc);
      const file = new File(['fake content'], image, { type: 'image/png' });
      const fileInput = screen.getByTestId('hidden-file-input');

      const updateButton = screen.getByTestId('updateProfilePictureDropdown');
      await userEvent.click(updateButton);

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => expect(screen.getByText('ui-users.information.profilePicture.localFile.modal.previewAndEdit')).toBeInTheDocument());

      const saveAndCloseButton = document.querySelector('[id="save-local-file-btn"]');
      fireEvent.click(saveAndCloseButton);
    });

    it('should handle local file upload compression error scenario', async () => {
      Compressor.mockImplementationOnce((croppedImage, options) => {
        return options.error(new Error('compression failed'));
      });

      renderProfilePicture(defaultProps);

      const updateButton = screen.getByTestId('updateProfilePictureDropdown');
      await userEvent.click(updateButton);
      const mockImage = new Image();

      const file = new File(['fake content'], mockImage, { type: 'image/png' });
      const fileInput = screen.getByTestId('hidden-file-input');
      fireEvent.change(fileInput, { target: { files: [file] } });
      await waitFor(() => expect(screen.getByText('ui-users.information.profilePicture.localFile.modal.previewAndEdit')).toBeInTheDocument());

      const saveAndCloseButton = document.querySelector('[id="save-local-file-btn"]');
      fireEvent.click(saveAndCloseButton);

      await waitFor(() => {
        expect(console.warn).toHaveBeenCalledWith('compression failed');
      });
    });

    it('should restrict local file upload and display callout for file exceeding maxFileSize', async () => {
      renderProfilePicture({ ...defaultProps, profilePictureMaxFileSize: 0.00001 });
      const updateButton = screen.getByTestId('updateProfilePictureDropdown');
      await userEvent.click(updateButton);
      const mockImage = new Image();
      const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const file = new File(['fake content'], mockImage, { type: 'image/png' });
      const fileInput = screen.getByTestId('hidden-file-input');

      fireEvent.click(fileInput, { target: { files: [file] } });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(sendCallout).toHaveBeenCalled();
        expect(consoleWarnMock).toHaveBeenCalledWith('max file size can be 0.00001mb.');
      });
    });

    it('should render delete confirmation modal', async () => {
      renderProfilePicture(defaultProps);
      const updateButton = screen.getByTestId('updateProfilePictureDropdown');
      await userEvent.click(updateButton);
      const deleteButton = screen.getByTestId('delete');
      await userEvent.click(deleteButton);

      expect(screen.getByText('ui-users.information.profilePicture.delete.modal.heading')).toBeInTheDocument();
    });

    it('should display callout when API fetch responds with error', async () => {
      Compressor.mockImplementationOnce((croppedImage, options) => {
        return options.success(croppedImage);
      });
      global.fetch = jest.fn().mockResolvedValueOnce(
        {
          ok: false,
          text: jest.fn().mockResolvedValueOnce('error message'),
        }
      );

      const mockCreateObjectURL = jest.fn(() => 'mockedURL');
      URL.createObjectURL = mockCreateObjectURL;

      const mockImage = new Image();
      mockImage.width = 100;
      mockImage.height = 200;
      jest.spyOn(canvasUtilsmodule, 'createImage').mockResolvedValueOnce(mockImage);
      jest.spyOn(canvasUtilsmodule, 'getCroppedImg').mockResolvedValueOnce('mocked-blob-data');

      const image = await canvasUtilsmodule.createImage(imageSrc);

      renderProfilePicture(defaultProps);

      const updateButton = screen.getByTestId('updateProfilePictureDropdown');
      await act(async () => userEvent.click(updateButton));

      const file = new File(['fake content'], image, { type: 'image/png' });
      const fileInput = screen.getByTestId('hidden-file-input');

      await act(async () => fireEvent.change(fileInput, { target: { files: [file] } }));
      await waitFor(() => expect(screen.getByText('ui-users.information.profilePicture.localFile.modal.previewAndEdit')).toBeInTheDocument());

      const saveAndCloseButton = document.querySelector('[id="save-local-file-btn"]');
      await act(async () => fireEvent.click(saveAndCloseButton));

      await waitFor(() => expect(screen.queryByText('ui-users.information.profilePicture.localFile.modal.previewAndEdit')).not.toBeInTheDocument());
      waitFor(() => expect(sendCallout).toHaveBeenCalled());
      waitFor(() => expect(console.error).toHaveBeenCalled());
    });

    it('should display callout when API fetch call fails', async () => {
      Compressor.mockImplementationOnce((croppedImage, options) => {
        return options.success(croppedImage);
      });
      global.fetch = jest.fn().mockRejectedValueOnce(
        {
          ok: false,
          text: jest.fn().mockResolvedValueOnce('error message'),
        }
      );

      const mockCreateObjectURL = jest.fn(() => 'mockedURL');
      URL.createObjectURL = mockCreateObjectURL;

      const mockImage = new Image();
      mockImage.width = 100;
      mockImage.height = 200;
      jest.spyOn(canvasUtilsmodule, 'createImage').mockResolvedValueOnce(mockImage);
      jest.spyOn(canvasUtilsmodule, 'getCroppedImg').mockResolvedValueOnce('mocked-blob-data');

      const image = await canvasUtilsmodule.createImage(imageSrc);

      renderProfilePicture(defaultProps);

      const updateButton = screen.getByTestId('updateProfilePictureDropdown');
      await act(async () => userEvent.click(updateButton));

      const file = new File(['fake content'], image, { type: 'image/png' });
      const fileInput = screen.getByTestId('hidden-file-input');

      await act(async () => fireEvent.change(fileInput, { target: { files: [file] } }));
      await waitFor(() => expect(screen.getByText('ui-users.information.profilePicture.localFile.modal.previewAndEdit')).toBeInTheDocument());

      const saveAndCloseButton = document.querySelector('[id="save-local-file-btn"]');
      await act(async () => fireEvent.click(saveAndCloseButton));

      await waitFor(() => expect(screen.queryByText('ui-users.information.profilePicture.localFile.modal.previewAndEdit')).not.toBeInTheDocument());
      waitFor(() => expect(sendCallout).toHaveBeenCalled());
      waitFor(() => expect(console.error).toHaveBeenCalled());
    });
  });

  describe('when profile picture is a uuid', () => {
    beforeEach(() => {
      useProfilePicture.mockClear().mockReturnValue({ profilePictureData: profilePicData.profile_picture_blob, isFetching: false });
      renderProfilePicture({ ...defaultProps, profilePictureId: 'cdc053ff-f88e-445c-878f-650472bd52e6' });
    });

    it('should display Profile picture', () => {
      expect(Img).toHaveBeenCalled();
      const renderedProfileImg = Img.mock.calls[0][0];
      expect(renderedProfileImg.alt).toBe('ui-users.information.profilePicture');
    });

    it('should display Profile picture Loader while fetching profile picture', () => {
      useProfilePicture.mockClear().mockReturnValue({ profilePictureData: profilePicData.profile_picture_blob, isFetching: true });
      renderProfilePicture({ ...defaultProps, profilePictureId: 'cdc053ff-f88e-445c-878f-650472bd52e6' });
      const profilePictureLoader = screen.getByTestId('profile-picture-loader').querySelector('.spinner');
      expect(profilePictureLoader).toBeInTheDocument();
    });
  });
});
