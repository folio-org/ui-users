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
import { isPatronUser, isStaffUser, base64ToBlob, isAValidUUID } from '../util';
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
const ERROR = 'error';
const SUCCESS = 'success';

const PrintLibraryCardButton = ({ user, patronGroup }) => {
  const callout = useCallout();
  const intl = useIntl();
  const { formatDateToParts } = intl;
  const { personal: { profilePictureLink }, active, expirationDate, personal } = user;
  const isPatronOrStaffUser = isPatronUser(user) || isStaffUser(user);
  const disabled = !active || !isPatronOrStaffUser || !profilePictureLink;
  const isProfilePicAValidUUID = profilePictureLink && isAValidUUID(profilePictureLink);

  const { profilePictureData } = useProfilePicture({ profilePictureId: profilePictureLink, isProfilePictureAUUID: isAValidUUID(profilePictureLink) });

  const formatExpirationDate = useCallback(() => {
    const dateParts = formatDateToParts(expirationDate);
    const date = ['day', 'month', 'year'].map(p => dateParts.filter(dp => dp.type === p)[0].value).join('/');
    return date;
  }, [expirationDate, formatDateToParts]);

  const updateUserForExport = useCallback(() => {
    const modifiedUser = cloneDeep(user);
    modifiedUser.patronGroup = patronGroup;
    modifiedUser.personal.firstName = personal.preferredFirstName || personal.firstName;
    modifiedUser.expirationDate = expirationDate ? formatExpirationDate() : '';
    return modifiedUser;
  }, [user, patronGroup, personal.preferredFirstName, personal.firstName, expirationDate, formatExpirationDate]);

  const showCallout = (type) => {
    const successMessage = type === SUCCESS && (
      isProfilePicAValidUUID ?
        <FormattedMessage id="ui-users.printLibraryCard.successMessage.withLocallyUploadedProfilePicture" /> :
        <FormattedMessage id="ui-users.printLibraryCard.successMessage.withExternallyLinkedProfilePicture" />
    );
    const message = type === ERROR ? <FormattedMessage id="ui-users.errors.generic" /> : successMessage;
    callout.sendCallout({
      message,
      type,
    });
  };

  const getOnlyFields = useCallback(() => {
    const fields = [...onlyFields];
    if (profilePictureLink && !isProfilePicAValidUUID) {
      fields.push(profilePictureField);
    }
    return fields;
  }, [isProfilePicAValidUUID, profilePictureLink]);

  const exportUserDetails = () => {
    const exportOptions = {
      onlyFields: getOnlyFields(),
      filename: `Patron_${user.barcode}`
    };
    const data = [updateUserForExport()];

    exportToCsv(data, exportOptions);
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

  const exportUserProfilePicture = () => {
    const blob = base64ToBlob(profilePictureData, 'image/png');
    downloadImage(blob);
  };

  /* ************************************************************************
  * handlePrintLibraryCard method should export
  * 1. user details
  * 2. user profile picture if profile picture config is enabled for tenant
  *    and user has one image against his profile
  ************************************************************************* */
  const handlePrintLibraryCard = () => {
    try {
      exportUserDetails();
      if (isProfilePicAValidUUID) {
        exportUserProfilePicture();
      }
      showCallout(SUCCESS);
    } catch (e) {
      console.error('Error downloading the image:', e); // eslint-disable-line no-console
      showCallout(ERROR);
    }
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
  user: PropTypes.shape({}),
  patronGroup: PropTypes.string,
};
export default PrintLibraryCardButton;
