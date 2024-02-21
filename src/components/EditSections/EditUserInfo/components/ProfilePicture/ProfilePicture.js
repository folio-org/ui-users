import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { getOrientation } from 'get-orientation/browser';

import {
  Button,
  Dropdown,
  DropdownMenu,
  Icon,
  Label,
  Loading,
} from '@folio/stripes/components';
import { useStripes } from '@folio/stripes/core';

import { useProfilePicture } from '../../../../../hooks';
import { isAValidURL } from '../../../../util/util';
import profilePicThumbnail from '../../../../../../icons/profilePicThumbnail.png';
import css from '../../EditUserInfo.css';
import ExternalLinkModal from '../ExternalLinkModal';
import DeleteProfilePictureModal from '../DeleteProfilePictureModal';
import LocalFileModal from '../LocalFileModal';
import { getRotatedImage, createImage } from './utils/canvasUtils';

import { PROFILE_PIC_API } from '../../../../../constants';

const ORIENTATION_TO_ANGLE = {
  '3': 180,
  '6': 90,
  '8': -90,
};

const ProfilePicture = ({ profilePictureId, form, personal }) => {
  const [profilePictureLink, setProfilePictureLink] = useState(profilePictureId);
  const [externalLinkModalOpen, setExternalLinkModalOpen] = useState(false);
  const [deleteProfilePictureModalOpen, setDeleteProfilePictureModalOpen] = useState(false);
  const [isProfilePictureDeleted, setIsProfilePictureDeleted] = useState(false);
  const [disableDeleteButton, setDisableDeleteButton] = useState(false);
  const [localFileModalOpen, setLocalFileModalOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedLocalImage, setCroppedLocalImage] = useState(null);
  const fileInputRef = useRef(null);

  const intl = useIntl();
  const stripes = useStripes();
  const { okapi } = stripes;
  const { url, token } = okapi;

  const hasProfilePicture = Boolean(profilePictureLink) || Boolean(croppedLocalImage);
  const isProfilePictureLinkAURL = hasProfilePicture && isAValidURL(profilePictureLink);
  const hasAllProfilePicturePerms = stripes.hasPerm('ui-users.profile-pictures.all');

  const { isFetching, profilePictureData } = useProfilePicture({ profilePictureId });

  const updateFormWithProfilePicture = (image) => {
    const { change } = form;
    const formState = form.getState();
    if (formState.pristine) {
      // disable delete button, until form is saved
      setDisableDeleteButton(true);
    }
    change('personal.profilePictureLink', image);
  };

  const toggleExternalLinkModal = () => {
    setExternalLinkModalOpen(prev => !prev);
  };

  const handleSaveExternalProfilePictureLink = (externalLink) => {
    updateFormWithProfilePicture(externalLink);
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

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const toggleLocalFileModal = () => {
    setLocalFileModalOpen(prev => !prev);
  };

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setLocalFileModalOpen(true);
      const file = e.target.files[0];
      let imageDataUrl = await readFile(file);

      try {
        // apply rotation if needed
        const orientation = await getOrientation(file);
        const rotationByOrientation = ORIENTATION_TO_ANGLE[orientation];
        if (rotationByOrientation) {
          const image = await createImage(imageDataUrl);
          imageDataUrl = await getRotatedImage(image, rotation);
        }
      } catch (evt) {
        console.warn('failed to detect the orientation');
      }

      setImageSrc(imageDataUrl);
      fileInputRef.current.value = '';
    }
  };

  const fileUploadAction = () => {
    fileInputRef.current.click();
  };

  const uploadBlob = async (blob) => {
    try {
      const response = await fetch(`${url}/${PROFILE_PIC_API}`, {
        method: 'POST',
        body: blob,
        headers: {
          'Content-Type': 'application/octet-stream',
          'x-okapi-token': `${token}`
        },
      });
      if (response.ok) {
        response.json()
          .then(resp => {
            updateFormWithProfilePicture(resp.id);
          })
          .catch(error => {
            console.error(error);
          });
      } else {
        console.error('Failed to upload blob');
      }
    } catch (error) {
      console.error('Error uploading blob:', error);
    }
  };

  const handleSaveLocalFile = (croppedImage) => {
    toggleLocalFileModal();
    uploadBlob(croppedImage);
    setCroppedLocalImage(URL.createObjectURL(croppedImage));
  };

  const renderProfilePic = () => {
    const profilePictureSrc = croppedLocalImage || (isProfilePictureLinkAURL ? profilePictureLink : 'data:;base64,' + profilePictureData);
    const imgSrc = isFetching || !hasProfilePicture ? profilePicThumbnail : profilePictureSrc;

    return isFetching ?
      <span data-testid="profile-picture-loader"> <Loading /> </span> :
      <img
        data-testid="profile-picture"
        className={css.profilePlaceholder}
        alt={intl.formatMessage({ id: 'ui-users.information.profilePicture' })}
        src={imgSrc}
      />;
  };

  const renderMenu = () => (
    <DropdownMenu
      aria-label="profile picture action menu"
      role="menu"
    >
      <Button
        data-testId="localFile"
        buttonStyle="dropdownItem"
        disabled={isProfilePictureDeleted}
        onClick={fileUploadAction}
      >
        <Icon icon="profile">
          {intl.formatMessage({ id: 'ui-users.information.profilePicture.localFile' })}
        </Icon>
      </Button>
      <Button
        data-testId="externalURL"
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
            data-testId="delete"
            buttonStyle="dropdownItem"
            onClick={toggleDeleteModal}
            disabled={isProfilePictureDeleted || disableDeleteButton}
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
      { renderProfilePic()}
      <br />
      <input type="file" hidden ref={fileInputRef} onChange={onFileChange} accept="image/*" />
      {
        hasAllProfilePicturePerms && (
          <Dropdown
            data-testId="updateProfilePictureDropdown"
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
      {
          imageSrc && localFileModalOpen && (
            <LocalFileModal
              open={localFileModalOpen}
              onClose={toggleLocalFileModal}
              rotation={rotation}
              setRotation={setRotation}
              imageSrc={imageSrc}
              onSave={handleSaveLocalFile}
            />
          )
      }
    </>
  );
};

ProfilePicture.propTypes = {
  form: PropTypes.object.isRequired,
  profilePictureId: PropTypes.string.isRequired,
  personal: PropTypes.object.isRequired,
};

export default ProfilePicture;
