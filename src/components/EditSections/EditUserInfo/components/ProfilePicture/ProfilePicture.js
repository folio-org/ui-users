import React, { useMemo, useState } from 'react';
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
import { isAValidURL } from '../../../../util/util';
import profilePicThumbnail from '../../../../../../icons/profilePicThumbnail.png';
import css from '../../EditUserInfo.css';
import ExternalLinkModal from '../ExternalLinkModal/ExternalLinkModal';

const ProfilePicture = ({ profilePictureId, form }) => {
  const [profilePictureLink, setProfilePictureLink] = useState(profilePictureId);
  const [externalLinkModalOpen, setExternalLinkModalOpen] = useState(false);
  const intl = useIntl();
  const stripes = useStripes();
  const hasProfilePicture = Boolean(profilePictureLink);
  const isProfilePictureLinkAURL = hasProfilePicture && isAValidURL(profilePictureLink);
  const hasAllProfilePicturePerms = stripes.hasPerm('ui-users.profile-pictures.all');

  const { isFetching, profilePictureData } = useProfilePicture({ profilePictureId });

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

  const toggleExternalLinkModal = () => {
    setExternalLinkModalOpen(prev => !prev);
  };

  const handleSaveExternalProfilePictureLink = (externalLink) => {
    const { change } = form;
    change('personal.profilePictureLink', externalLink);
    toggleExternalLinkModal();
    setProfilePictureLink(externalLink);
  };

  const renderMenu = () => (
    <DropdownMenu
      aria-label="profile picture action menu"
      role="menu"
    >
      <Button buttonStyle="dropdownItem"><Icon icon="profile">Local File</Icon></Button>
      <Button
        data-testId="externalURL"
        buttonStyle="dropdownItem"
        onClick={toggleExternalLinkModal}
      >
        <Icon icon="external-link">External URL</Icon>
      </Button>
      <Button buttonStyle="dropdownItem"><Icon icon="trash">Delete</Icon></Button>
    </DropdownMenu>
  );

  return (
    <>
      <Label tagName="div">
        {
          intl.formatMessage({ id: 'ui-users.information.profilePicture' })
        }
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
      {
        externalLinkModalOpen && (
          <ExternalLinkModal
            open={externalLinkModalOpen}
            onClose={toggleExternalLinkModal}
            onSave={handleSaveExternalProfilePictureLink}
            profilePictureLink={isProfilePictureLinkAURL ? profilePictureLink : ''}
          />
        )
      }
    </>
  );
};

ProfilePicture.propTypes = {
  form: PropTypes.object.isRequired,
  profilePictureId: PropTypes.string.isRequired,
};

export default ProfilePicture;
