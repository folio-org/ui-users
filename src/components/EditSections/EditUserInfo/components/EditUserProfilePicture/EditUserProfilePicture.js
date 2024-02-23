import React, { useState } from 'react';
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
import ExternalLinkModal from '../ExternalLinkModal';
import DeleteProfilePictureModal from '../DeleteProfilePictureModal';
import ProfilePicture from '../ProfilePicture';

const EditUserProfilePicture = ({ profilePictureId, form, personal }) => {
  const [profilePictureLink, setProfilePictureLink] = useState(profilePictureId);
  const [externalLinkModalOpen, setExternalLinkModalOpen] = useState(false);
  const [deleteProfilePictureModalOpen, setDeleteProfilePictureModalOpen] = useState(false);
  const [isProfilePictureDeleted, setIsProfilePictureDeleted] = useState(false);
  const intl = useIntl();
  const stripes = useStripes();
  const hasAllProfilePicturePerms = stripes.hasPerm('ui-users.profile-pictures.all');

  const hasProfilePicture = Boolean(profilePictureLink);
  const isProfilePictureLinkAURL = hasProfilePicture && isAValidURL(profilePictureLink);
  const { isFetching, profilePictureData } = useProfilePicture({ profilePictureId: profilePictureLink });
  const toggleExternalLinkModal = () => {
    setExternalLinkModalOpen(prev => !prev);
  };

  const handleSaveExternalProfilePictureLink = (externalLink) => {
    const { change } = form;
    change('personal.profilePictureLink', externalLink);
    toggleExternalLinkModal();
    setProfilePictureLink(externalLink);
  };

  const toggleDeleteModal = () => {
    setDeleteProfilePictureModalOpen(prev => !prev);
  };

  const handleProfilePictureDelete = () => {
    const { change } = form;
    change('personal.profilePictureLink', undefined);
    toggleDeleteModal();
    setProfilePictureLink('');
    setIsProfilePictureDeleted(true);
  };

  const renderMenu = () => (
    <DropdownMenu
      aria-label="profile picture action menu"
      role="menu"
    >
      <Button
        buttonStyle="dropdownItem"
        disabled={isProfilePictureDeleted}
      >
        <Icon icon="profile">
          {intl.formatMessage({ id: 'ui-users.information.profilePicture.localFile' })}
        </Icon>
      </Button>
      <Button
        data-testid="externalURL"
        buttonStyle="dropdownItem"
        disabled={isProfilePictureDeleted}
        onClick={toggleExternalLinkModal}
      >
        <Icon icon="external-link">
          {intl.formatMessage({ id: 'ui-users.information.profilePicture.externalURL' })}
        </Icon>
      </Button>
      {
        profilePictureId && (
          <Button
            data-testid="delete"
            buttonStyle="dropdownItem"
            onClick={toggleDeleteModal}
            disabled={isProfilePictureDeleted}
          >
            <Icon icon="trash">
              {intl.formatMessage({ id: 'ui-users.information.profilePicture.delete' })}
            </Icon>
          </Button>
        )
      }

    </DropdownMenu>
  );

  return (
    <>
      <Label tagName="div">
        {
          intl.formatMessage({ id: 'ui-users.information.profilePicture' })
        }
      </Label>
      <ProfilePicture
        profilePictureLink={profilePictureLink}
        isFetching={isFetching}
        profilePictureData={profilePictureData}
      />
      <br />
      {
        hasAllProfilePicturePerms && (
          <Dropdown
            data-testid="updateProfilePictureDropdown"
            id="updateProfilePictureDropdown"
            label={intl.formatMessage({ id: 'ui-users.information.profilePicture.update' })}
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
      {
        deleteProfilePictureModalOpen && (
          <DeleteProfilePictureModal
            open={deleteProfilePictureModalOpen}
            onClose={toggleDeleteModal}
            onConfirm={handleProfilePictureDelete}
            personal={personal}
          />
        )
      }
    </>
  );
};

EditUserProfilePicture.propTypes = {
  form: PropTypes.object.isRequired,
  profilePictureId: PropTypes.string.isRequired,
  personal: PropTypes.object.isRequired,
};

export default EditUserProfilePicture;
