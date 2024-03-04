import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Cropper from 'react-easy-crop';

import {
  Button,
  Modal,
  ModalFooter,
  Row,
  Col,
} from '@folio/stripes/components';

import { getCroppedImg, createImage } from '../EditUserProfilePicture/utils/canvasUtils';
import Slider from './components/Slider';

import css from './LocalFileModal.css';

const DEFAULT_ZOOM = 1;

const LocalFileModal = ({ open, onClose, imageSrc, rotation, setRotation, onSave }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const showCroppedImage = useCallback(async () => {
    try {
      const image = await createImage(imageSrc);
      const cropped = await getCroppedImg(
        image,
        croppedAreaPixels,
        rotation
      );
      onSave(cropped);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }, [croppedAreaPixels, imageSrc, onSave, rotation]);

  const handleSaveProfilePictureLocalFile = useCallback(() => {
    setZoom(DEFAULT_ZOOM);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
    showCroppedImage();
  }, [setRotation, showCroppedImage]);

  const onCropComplete = (croppedArea, croppedAreaPxs) => {
    setCroppedAreaPixels(croppedAreaPxs);
  };

  const handleClose = useCallback(() => {
    setZoom(DEFAULT_ZOOM);
    setRotation(0);
    onClose();
  }, [onClose, setRotation]);

  const renderFooter = useCallback(() => {
    return (
      <ModalFooter>
        <Button
          buttonStyle="primary"
          id="save-external-link-btn"
          onClick={handleSaveProfilePictureLocalFile}
        >
          <FormattedMessage id="ui-users.saveAndClose" />
        </Button>
        <Button
          onClick={handleClose}
        >
          <FormattedMessage id="stripes-core.button.cancel" />
        </Button>
      </ModalFooter>
    );
  }, [handleSaveProfilePictureLocalFile, handleClose]);

  return (
    <Modal
      open={open}
      size="medium"
      label={<FormattedMessage id="ui-users.information.profilePicture.localFile.modal.previewAndEdit" />}
      footer={renderFooter()}
    >
      <div className={css.modalBodyContainer}>
        <div
          className={css.cropContainer}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            rotation={rotation}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
        <Row>
          <Col xs={4}>
            <Slider
              value={zoom}
              min={1}
              max={5}
              step={0.1}
              handleChange={(e) => setZoom(Number(e.target.value))}
              label="zoom"
            />
          </Col>
          <Col xs={4}>
            <Slider
              value={rotation}
              min={0}
              max={360}
              step={1}
              handleChange={(e) => setRotation(Number(e.target.value))}
              label="rotate"
            />
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

LocalFileModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  imageSrc: PropTypes.string,
  rotation: PropTypes.number,
  setRotation: PropTypes.func,
  onSave: PropTypes.func,
};
export default LocalFileModal;
