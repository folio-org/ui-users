import { screen, render } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import WebcamModal from './WebcamModal';

jest.mock('../EditUserProfilePicture/utils/canvasUtils', () => ({
  ...jest.requireActual('../EditUserProfilePicture/utils/canvasUtils'),
  getCroppedImg: jest.fn(),
  createImage: jest.fn(),
}));

jest.mock('react-webcam', () => {
  // eslint-disable-next-line global-require
  const React = require('react');

  return {
    __esModule: true,
    default: React.forwardRef(function Webcam(_, ref) {
      const mockWebcam = {
        getScreenshot: jest
          .fn()
          .mockReturnValue('data:image/jpeg;base64,mock'),
        video: {
          videoWidth: 1280,
          videoHeight: 720,
        },
      };

      React.useImperativeHandle(ref, () => mockWebcam);

      return (
        <div data-testid="webcam-mock" />
      );
    }),
  };
});

describe('WebcamModal', () => {
  const props = {
    open: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
  };

  beforeEach(() => {
    render(
      <WebcamModal {...props} />
    );
  });

  it('should render webcam modal', () => {
    expect(screen.getAllByText('ui-users.information.profilePicture.takePhoto')[0]).toBeInTheDocument();
  });

  it('should take a picture', async () => {
    expect(screen.getByRole('button', { name: /saveAndClose/ })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: /takePhoto/ }));

    expect(screen.getByRole('button', { name: /saveAndClose/ })).toBeEnabled();
  });

  it('should call onSave', async () => {
    await userEvent.click(screen.getByRole('button', { name: /takePhoto/ }));

    await userEvent.click(screen.getByRole('button', { name: /saveAndClose/ }));

    expect(props.onSave).toHaveBeenCalled();
  });

  it('should close modal on clicking cancel button', async () => {
    await userEvent.click(screen.getByRole('button', { name: 'stripes-core.button.cancel' }));

    expect(props.onClose).toHaveBeenCalled();
  });
});
