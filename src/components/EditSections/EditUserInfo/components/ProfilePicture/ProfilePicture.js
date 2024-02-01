import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import {
  Button,
  Dropdown,
  DropdownMenu,
  Icon,
  Label,
} from '@folio/stripes/components';
import { useStripes } from '@folio/stripes/core';

import { useProfilePicture } from '../../../../../hooks';
import { isAValidUUID } from '../../../../util/util';
import profilePicThumbnail from '../../../../../../icons/profilePicThumbnail.png';
import css from '../../EditUserInfo.css';

const ProfilePicture = ({ label, profilePictureLink }) => {
  const intl = useIntl();
  const stripes = useStripes();
  const isProfilePictureLinkAURL = !isAValidUUID(profilePictureLink);
  const hasProfilePicture = Boolean(profilePictureLink);
  const { isFetching, profilePictureData } = useProfilePicture({ profilePictureId: profilePictureLink });
  const hasAllProfilePicturePerms = stripes.hasPerm('ui-users.profile-pictures.all');

  const renderProfilePic = () => {
    const profilePictureSrc = isProfilePictureLinkAURL ? profilePictureLink : 'data:;base64,' + profilePictureData;
    const imgSrc = isFetching || !hasProfilePicture ? profilePicThumbnail : profilePictureSrc;

    return (
      <img
        data-testid="profile-picture"
        className={css.profilePlaceholder}
        alt={intl.formatMessage({ id: 'ui-users.information.profilePicture' })}
        src={imgSrc}
      />
    );
  };

  const renderMenu = () => (
    <DropdownMenu
      aria-label="profile picture action menu"
      role="menu"
    >
      <Button buttonStyle="dropdownItem"><Icon icon="profile">Local File</Icon></Button>
      <Button buttonStyle="dropdownItem"><Icon icon="external-link">External URL</Icon></Button>
      <Button buttonStyle="dropdownItem"><Icon icon="trash">Delete</Icon></Button>
    </DropdownMenu>
  );

  return (
    <>
      <Label tagName="div">
        {label}
      </Label>
      { renderProfilePic()}
      <br />
      {
        hasAllProfilePicturePerms && (
          <Dropdown
            data-testId="updateProfilePictureDropdown"
            id="updateProfilePictureDropdown"
            label="Update"
            placement="bottom-end"
            renderMenu={renderMenu}
          />
        )
      }
    </>
  );
};

ProfilePicture.propTypes = {
  label: PropTypes.node.isRequired,
  profilePictureLink: PropTypes.string,
};

export default ProfilePicture;
