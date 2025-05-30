import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { getOrientation } from 'get-orientation/browser';
import Compressor from 'compressorjs';

import { getHeaderWithCredentials } from '@folio/stripes/util';
import {
  Button,
  Dropdown,
  DropdownMenu,
  Icon,
  Label,
} from '@folio/stripes/components';
import { useStripes, useCallout } from '@folio/stripes/core';
import { ProfilePicture } from '@folio/stripes/smart-components';

import { isAValidURL } from '../../../../util/util';
import ExternalLinkModal from '../ExternalLinkModal';
import DeleteProfilePictureModal from '../DeleteProfilePictureModal';
import LocalFileModal from '../LocalFileModal';
import WebcamModal from '../WebcamModal';
import { getRotatedImage, createImage } from './utils/canvasUtils';
import {
  ACCEPTED_IMAGE_TYPES,
  PROFILE_PIC_API,
  PROFILE_PIC_DEFAULT_MAX_SIZE_IN_MB,
} from '../../../../../constants';

const ORIENTATION_TO_ANGLE = {
  '3': 180,
  '6': 90,
  '8': -90,
};

const COMPRESSION_OPTIONS = {
  quality: 0.9,
  maxWidth: 300,
  maxHeight: 300,
  checkOrientation: false,
};

const EditUserProfilePicture = ({ profilePictureId, form, personal, profilePictureMaxFileSize }) => {
  const [profilePictureLink, setProfilePictureLink] = useState(profilePictureId);
  const [externalLinkModalOpen, setExternalLinkModalOpen] = useState(false);
  const [webcamModalOpen, setWebcamModalOpen] = useState(false);
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
  const callout = useCallout();
  const { okapi, okapi: { url } } = stripes;

  const hasProfilePicture = Boolean(profilePictureLink) || Boolean(croppedLocalImage);
  const isProfilePictureLinkAURL = hasProfilePicture && isAValidURL(profilePictureLink);
  const hasAllProfilePicturePerms = stripes.hasPerm('ui-users.profile-pictures.all');

  const updateFormWithProfilePicture = (image) => {
    const { change } = form;
    const formState = form.getState();
    if (formState.pristine) {
      // disable delete button, until form is saved
      setDisableDeleteButton(true);
    }
    change('personal.profilePictureLink', image);
  };

  const toggleExternalLinkModal = useCallback(() => {
    setExternalLinkModalOpen(prev => !prev);
  }, []);

  const handleSaveExternalProfilePictureLink = (externalLink) => {
    updateFormWithProfilePicture(externalLink);
    toggleExternalLinkModal();
    setProfilePictureLink(externalLink);
  };

  const toggleDeleteModal = useCallback(() => {
    setDeleteProfilePictureModalOpen(prev => !prev);
  }, []);

  const handleProfilePictureDelete = useCallback(() => {
    const { change } = form;
    change('personal.profilePictureLink', undefined);
    toggleDeleteModal();
    setProfilePictureLink('');
    setIsProfilePictureDeleted(true);
  }, [form, toggleDeleteModal]);

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const toggleLocalFileModal = useCallback(() => {
    setLocalFileModalOpen(prev => !prev);
  }, []);

  const toggleWebcamModal = useCallback(() => {
    setWebcamModalOpen(prev => !prev);
  }, []);

  // to invoke error callout message on same local file upload.
  const onFileSelect = (event) => {
    event.target.value = '';
  };

  const onFileChange = async (e) => {
    const maxFileSize = profilePictureMaxFileSize || PROFILE_PIC_DEFAULT_MAX_SIZE_IN_MB;
    const maxFileSizeInBytes = maxFileSize * 1024 * 1024;
    if (maxFileSizeInBytes && e.target.files?.length > 0) {
      if (e.target.files[0].size > maxFileSizeInBytes) {
        callout.sendCallout({
          type: 'error',
          message: intl.formatMessage(
            { id: 'ui-users.information.profilePicture.localFile.maxFileSize.error' },
            { maxFileSize },
          ),
        });
        // eslint-disable-next-line no-console
        console.warn('max file size can be ' + profilePictureMaxFileSize + 'mb.');
      } else {
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
          // eslint-disable-next-line no-console
          console.warn('failed to detect the orientation');
        }

        setImageSrc(imageDataUrl);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const fileUploadAction = () => {
    fileInputRef.current.click();
  };

  const uploadBlob = async (blob) => {
    const headersWithCredentials = getHeaderWithCredentials(okapi);
    const headers = {
      ...headersWithCredentials,
      headers: {
        ...headersWithCredentials.headers,
        'Content-Type': 'application/octet-stream',
      }
    };

    try {
      const response = await fetch(`${url}/${PROFILE_PIC_API}`, {
        method: 'POST',
        ...headers,
        body: blob,
      });

      if (response.ok) {
        response.json()
          .then(resp => {
            updateFormWithProfilePicture(resp.id);
            setCroppedLocalImage(URL.createObjectURL(blob));
          })
          .catch(error => {
            // eslint-disable-next-line no-console
            console.error(error);
          });
      } else {
        const errMsg = await response.text();
        // eslint-disable-next-line no-console
        console.error(errMsg);
        // eslint-disable-next-line no-console
        console.error(new Error('Failed to upload blob'));
        callout.sendCallout({
          type: 'error',
          message: intl.formatMessage(
            { id: 'ui-users.errors.generic' },
          ),
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error uploading blob:', error);
      callout.sendCallout({
        type: 'error',
        message: intl.formatMessage(
          { id: 'ui-users.errors.generic' },
        ),
      });
    }
    toggleLocalFileModal();
  };

  const getCompressedImage = (croppedImage) => {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-new
      return new Compressor(croppedImage, {
        ...COMPRESSION_OPTIONS,
        success: (compressedImg) => {
          resolve(compressedImg);
        },
        error: (err) => reject(err),
      });
    });
  };

  const handleSaveLocalFile = async (croppedImage) => {
    try {
      const data = await getCompressedImage(croppedImage);
      uploadBlob(data);
    } catch (err) {
      toggleLocalFileModal();
      // eslint-disable-next-line no-console
      console.warn(err.message);
    }
  };

  const handleSaveWebcamProfilePhoto = async (img) => {
    try {
      const data = await getCompressedImage(img);
      uploadBlob(data);
    } catch (err) {
      toggleWebcamModal();
      // eslint-disable-next-line no-console
      console.warn(err.message);
    }
  };

  const renderMenu = () => (
    <DropdownMenu
      aria-label="profile picture action menu"
      role="menu"
    >
      <Button
        data-testid="localFile"
        buttonStyle="dropdownItem"
        disabled={isProfilePictureDeleted}
        onClick={fileUploadAction}
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
      <Button
        data-testid="webcam"
        buttonStyle="dropdownItem"
        disabled={isProfilePictureDeleted}
        onClick={toggleWebcamModal}
      >
        <Icon icon="profile">
          {intl.formatMessage({ id: 'ui-users.information.profilePicture.takePhoto' })}
        </Icon>
      </Button>
      {
        profilePictureId && (
          <Button
            data-testid="delete"
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
      <ProfilePicture
        profilePictureLink={profilePictureLink}
        croppedLocalImage={croppedLocalImage}
      />
      <input type="file" data-testid="hidden-file-input" hidden ref={fileInputRef} onClick={onFileSelect} onChange={onFileChange} accept={ACCEPTED_IMAGE_TYPES} />
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
        webcamModalOpen && (
          <WebcamModal
            open={webcamModalOpen}
            onClose={toggleWebcamModal}
            onSave={handleSaveWebcamProfilePhoto}
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

EditUserProfilePicture.propTypes = {
  form: PropTypes.object.isRequired,
  profilePictureId: PropTypes.string,
  personal: PropTypes.object.isRequired,
  profilePictureMaxFileSize: PropTypes.number.isRequired,
};

export default EditUserProfilePicture;
