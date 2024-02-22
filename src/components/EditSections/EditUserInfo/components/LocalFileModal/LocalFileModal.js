import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Modal,
  ModalFooter,
  Row,
  Col,
} from '@folio/stripes/components';
import Cropper from 'react-easy-crop';
import { getCroppedImg, createImage } from '../ProfilePicture/utils/canvasUtils';
import Slider from './components/Slider';
import css from './LocalFileModal.css';

const defaultZoom = 1;

const LocalFileModal = ({ open, onClose, imageSrc, rotation, setRotation, onSave }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(defaultZoom);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const showCroppedImage = async () => {
    try {
      const image = await createImage(imageSrc);
      const cropped = await getCroppedImg(
        image,
        croppedAreaPixels,
        rotation
      );
      onSave(cropped);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveProfilePictureLocalFile = () => {
    setZoom(defaultZoom);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
    showCroppedImage();
  };

  const onCropComplete = (croppedArea, croppedAreaPxs) => {
    setCroppedAreaPixels(croppedAreaPxs);
  };

  const renderFooter = () => {
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
          onClick={onClose}
        >
          <FormattedMessage id="stripes-core.button.cancel" />
        </Button>
      </ModalFooter>
    );
  };

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
              min="1"
              max="5"
              step="0.1"
              handleChange={(e) => setZoom(e.target.value)}
              label="zoom"
            />
          </Col>
          <Col xs={4}>
            <Slider
              value={rotation}
              min="0"
              max="360"
              step="1"
              handleChange={(e) => setRotation(e.target.value)}
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
