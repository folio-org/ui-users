import { screen, render, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import ppData from 'fixtures/userProfilePicture';

import { exportToCsv } from '@folio/stripes/components';
import { useProfilePicture } from '@folio/stripes/smart-components';
import { useCallout } from '@folio/stripes/core';

import PrintLibraryCardButton from './PrintLibraryCardButton';

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  exportToCsv: jest.fn(),
  Icon: jest.fn((props) => (props && props.children ? props.children : <span />)),
}));

jest.mock('@folio/stripes/smart-components', () => ({
  ...jest.requireActual('@folio/stripes/smart-components'),
  useProfilePicture: jest.fn(),
}));

describe('PrintLibraryCard', () => {
  const sendCallout = jest.fn();

  describe('when user is active and type is patron or staff', () => {
    describe('when user has profile picture - uuid for profile picture link in user personal details', () => {
      beforeEach(() => {
        useProfilePicture
          .mockClear()
          .mockReturnValue({ profilePictureData: ppData.ppbase64String });

        const props = {
          user: {
            expirationDate: '2024-07-09T23:59:59.000+00:00',
            active: true,
            type: 'staff',
            personal: {
              firstName: 'firstName',
              lastName: 'lastName',
              profilePictureLink: '02128bad-5852-4907-8714-3ca780124a21',
            },
            patronGroup: 'patronGroupId'
          },
          patronGroup: 'patronGroup',
        };
        render(<PrintLibraryCardButton {...props} />);
      });

      it('should display print library card button', () => {
        expect(screen.getByText('ui-users.printLibraryCard')).toBeInTheDocument();
      });

      it('should export CSV file', async () => {
        const printLibraryCardButton = screen.getByTestId('print-library-card');
        await userEvent.click(printLibraryCardButton);

        await waitFor(() => expect(exportToCsv).toHaveBeenCalled());
      });

      it('should export user pp jpg file', async () => {
        global.URL.createObjectURL = jest.fn();
        global.Blob = jest.fn();
        global.navigator.msSaveBlob = jest.fn();
        const spy = jest.spyOn(global.navigator, 'msSaveBlob');

        const printLibraryCardButton = screen.getByTestId('print-library-card');
        await userEvent.click(printLibraryCardButton);


        await waitFor(() => expect(spy).toHaveBeenCalled());

        spy.mockRestore();
      });
    });

    describe('when user has profile picture - url for profile picture link in user personal details', () => {
      const props = {
        user: {
          active: true,
          type: 'staff',
          personal: {
            firstName: 'firstName',
            lastName: 'lastName',
            profilePictureLink: 'https://www.colorado.edu/libraries/sites/default/files/styles/square/public/article-thumbnail/folio_cropped.jpg?itok=_rnTg5jr',
          },
          patronGroup: 'patronGroupId'
        },
        patronGroup: 'patronGroup',
      };

      beforeEach(() => {
        useProfilePicture
          .mockClear()
          .mockReturnValue({ profilePictureData: 'profilePictureData' });
      });

      it('should display print library card button', () => {
        render(<PrintLibraryCardButton {...props} />);

        expect(screen.getByText('ui-users.printLibraryCard')).toBeInTheDocument();
      });

      it('should export CSV file', async () => {
        render(<PrintLibraryCardButton {...props} />);

        const printLibraryCardButton = screen.getByTestId('print-library-card');
        await userEvent.click(printLibraryCardButton);

        await waitFor(() => expect(exportToCsv).toHaveBeenCalled());
      });

      it('should not export user pp jpg file', async () => {
        global.fetch = jest.fn(() => Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(new Blob(['image data'], { type: 'image/jpeg' })),
        }));
        global.URL.createObjectURL = jest.fn();
        global.Blob = jest.fn();
        global.navigator.msSaveBlob = jest.fn();
        const spy = jest.spyOn(global.navigator, 'msSaveBlob');

        render(<PrintLibraryCardButton {...props} />);

        const printLibraryCardButton = screen.getByTestId('print-library-card');
        await userEvent.click(printLibraryCardButton);


        await waitFor(() => expect(spy).not.toHaveBeenCalled());

        spy.mockRestore();
      });
    });
  });

  describe('when user is not active or type is other than patron or staff or user data do not have a profilePictureLink', () => {
    beforeEach(() => {
      useProfilePicture
        .mockClear()
        .mockReturnValue({ profilePictureData: 'profilePictureData' });
    });

    it('should disable printLibraryCardButton for inactive user', () => {
      const props = {
        user: {
          expirationDate: '2024-07-09T23:59:59.000+00:00',
          active: false,
          type: 'staff',
          personal: {
            firstName: 'firstName',
            lastName: 'lastName',
          },
          patronGroup: 'patronGroupId'
        },
        patronGroup: 'patronGroup',
      };
      render(<PrintLibraryCardButton {...props} />);
      expect(screen.getByTestId('print-library-card')).toBeDisabled();
    });

    it('should disable printLibraryCardButton for user who is not of type patron or staff', () => {
      const props = {
        user: {
          expirationDate: '2024-07-09T23:59:59.000+00:00',
          active: true,
          personal: {
            firstName: 'firstName',
            lastName: 'lastName',
          },
          patronGroup: 'patronGroupId'
        },
        patronGroup: 'patronGroup',
      };
      render(<PrintLibraryCardButton {...props} />);
      expect(screen.getByTestId('print-library-card')).toBeDisabled();
    });

    it('should disable printLibraryCardButton for user data do not have profile picture link', () => {
      const props = {
        user: {
          expirationDate: '2024-07-09T23:59:59.000+00:00',
          active: true,
          type: 'staff',
          personal: {
            firstName: 'firstName',
            lastName: 'lastName',
          },
          patronGroup: 'patronGroupId'
        },
        patronGroup: 'staff',
      };
      render(<PrintLibraryCardButton {...props} />);
      expect(screen.getByTestId('print-library-card')).toBeDisabled();
    });
  });

  describe('when exportToCSV throws an error', () => {
    const props = {
      user: {
        expirationDate: '2024-07-09T23:59:59.000+00:00',
        active: true,
        type: 'staff',
        personal: {
          firstName: 'firstName',
          lastName: 'lastName',
          profilePictureLink: '60312a8f-a6e5-47a2-bbdc-cee579c8d215'
        },
        patronGroup: 'patronGroupId'
      },
      patronGroup: 'patronGroup',
    };

    beforeEach(() => {
      sendCallout.mockClear();
      useCallout.mockClear().mockReturnValue({ sendCallout });
      exportToCsv
        .mockClear()
        .mockImplementationOnce(() => {
          throw new Error('Fetch failed');
        });
      render(<PrintLibraryCardButton {...props} />);
    });

    it('should call show callout', async () => {
      const printLibraryCardButton = screen.getByTestId('print-library-card');
      await userEvent.click(printLibraryCardButton);

      await waitFor(() => expect(sendCallout).toHaveBeenCalled());
    });

    it('should not export profile picture', async () => {
      global.URL.createObjectURL = jest.fn();
      global.Blob = jest.fn();
      global.navigator.msSaveBlob = jest.fn();
      const spy = jest.spyOn(global.navigator, 'msSaveBlob');

      const printLibraryCardButton = screen.getByTestId('print-library-card');
      await userEvent.click(printLibraryCardButton);

      await waitFor(() => expect(spy).not.toHaveBeenCalled());

      spy.mockRestore();
    });
  });
});
