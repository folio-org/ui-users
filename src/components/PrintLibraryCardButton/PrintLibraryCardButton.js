import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { cloneDeep } from 'lodash';

import { useCallout } from '@folio/stripes/core';
import {
  Button,
  Icon,
  exportToCsv,
} from '@folio/stripes/components';
import { useProfilePicture } from '@folio/stripes/smart-components';
import { isPatronUser, isStaffUser, base64ToBlob, isAValidUUID, isAValidURL } from '../util';
import { USER_INFO } from '../../constants';

const { BARCODE, FIRST_NAME, LAST_NAME, MIDDLE_NAME, PATRON_GROUP, EXPIRATION_DATE, PROFILE_PICTURE_LINK } = USER_INFO;
const profilePictureField = {
  label: 'Profile Picture Link ',
  value: PROFILE_PICTURE_LINK
};
const onlyFields = [
  {
    label: 'Barcode',
    value: BARCODE
  },
  {
    label: 'First Name',
    value: FIRST_NAME
  },
  {
    label: 'Middle Name',
    value: MIDDLE_NAME
  },
  {
    label: 'Last Name',
    value: LAST_NAME
  },
  {
    label: 'Patron Group',
    value: PATRON_GROUP
  },
  {
    label: 'Expiration Date',
    value: EXPIRATION_DATE
  },
];
const dateFormat = { year: 'numeric', month: 'numeric', day: 'numeric' };

const PrintLibraryCardButton = ({ user, patronGroup }) => {
  const callout = useCallout();
  const intl = useIntl();
  const { formatDate } = intl;
  const { personal: { profilePictureLink }, active } = user;
  const isPatronOrStaffUser = isPatronUser(user) || isStaffUser(user);
  const disabled = !active || !isPatronOrStaffUser;

  const { profilePictureData } = useProfilePicture({ profilePictureId: profilePictureLink, isProfilePictureAUUID: isAValidUUID(profilePictureLink) });

  const updateUserForExport = useCallback(() => {
    const { personal, expirationDate } = user;
    const modifiedUser = cloneDeep(user);
    modifiedUser.patronGroup = patronGroup;
    modifiedUser.personal.firstName = personal.preferredFirstName || personal.firstName;
    modifiedUser.expirationDate = expirationDate ? formatDate(expirationDate, dateFormat) : '';
    return modifiedUser;
  }, [user, patronGroup, formatDate]);

  const showCallout = () => {
    callout.sendCallout({
      message: <FormattedMessage id="ui-users.errors.generic" />,
      type: 'error',
    });
  };

  const getOnlyFields = useCallback(() => {
    const fields = [...onlyFields];
    if (profilePictureLink && isAValidURL(profilePictureLink)) {
      fields.push(profilePictureField);
    }
    return fields;
  }, [profilePictureLink]);

  const exportUserDetails = () => {
    const exportOptions = {
      onlyFields: getOnlyFields(),
      filename: `Patron_${user.barcode}`
    };
    const data = [updateUserForExport()];

    try {
      exportToCsv(data, exportOptions);
    } catch (error) {
      console.error('Error downloading the csv:', error); // eslint-disable-line no-console
      showCallout();
    }
  };

  const downloadImage = (blob) => {
    const profilePictureFileName = `${user.barcode}.jpg`;

    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, profilePictureFileName);
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('data-test-exportpp-link', 'true');
        link.setAttribute('download', profilePictureFileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        // prevent file downloading on testing env
        if (process.env.NODE_ENV !== 'test') {
          window.setTimeout(() => {
            link.click();
            document.body.removeChild(link);
          }, 50);
        }// Need to debounce this click event from others (Pane actionMenuItems dropdown)
      } else {
        console.error('Failed to trigger download for CSV data'); // eslint-disable-line no-console
        throw new Error('Failed to trigger download for CSV data');
      }
    }
  };

  const exportUserProfPicFromBase64String = () => {
    try {
      const blob = base64ToBlob(profilePictureData, 'image/png');
      downloadImage(blob);
    } catch (error) {
      console.error('Error downloading the image:', error); // eslint-disable-line no-console
      showCallout();
    }
  };

  const exportUserProfilePicture = () => {
    if (isAValidUUID(profilePictureLink)) {
      exportUserProfPicFromBase64String();
    }
  };

  /* ************************************************************************
  * handlePrintLibraryCard method should export
  * 1. user details
  * 2. user profile picture if profile picture config is enabled for tenant
  *    and user has one image against his profile
  ************************************************************************* */
  const handlePrintLibraryCard = () => {
    exportUserDetails();
    if (profilePictureLink) exportUserProfilePicture();
  };

  return (
    <Button
      data-testid="print-library-card"
      buttonStyle="dropdownItem"
      onClick={handlePrintLibraryCard}
      disabled={disabled}
    >
      <Icon icon="print">
        <FormattedMessage id="ui-users.printLibraryCard" />
      </Icon>
    </Button>
  );
};

PrintLibraryCardButton.propTypes = {
  user: PropTypes.object,
  patronGroup: PropTypes.string,
};
export default PrintLibraryCardButton;
