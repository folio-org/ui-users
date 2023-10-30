import React, { useState } from 'react';
import {
  Button,
  Row,
  Col,
  Icon,
  Modal,
  ModalFooter,
} from '@folio/stripes/components';
import { FormattedMessage } from 'react-intl';
import Cropper from 'react-easy-crop';
import { getOrientation } from 'get-orientation/browser';

import { getCroppedImg, getRotatedImage } from './canvasUtils';
import Slider from './components/Slider';
import css from './ProfilePicPOC1.css';

const ORIENTATION_TO_ANGLE = {
  '3': 180,
  '6': 90,
  '8': -90,
};

const ProfilePicPOC1 = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageSaved, setImageSaved] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);

  const [open, setOpen] = useState(false);

  function readFile(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  }

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      let imageDataUrl = await readFile(file);

      try {
        // apply rotation if needed
        const orientation = await getOrientation(file);
        const rotationByOrientation = ORIENTATION_TO_ANGLE[orientation];
        if (rotationByOrientation) {
          imageDataUrl = await getRotatedImage(imageDataUrl, rotation);
        }
      } catch (evt) {
        console.warn('failed to detect the orientation');
      }

      setImageSrc(imageDataUrl);
      setOpen(true);
    }
  };

  const showCroppedImage = async () => {
    try {
      const cropped = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );
      console.log('donee', { cropped });
      setCroppedImage(cropped);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = () => {
    setOpen(false);
    setImageSaved(true);
    setZoom(1);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
    showCroppedImage();
  };

  const footer = (
    <ModalFooter>
      <Button onClick={handleSave} buttonStyle="primary" marginBottom0>
        <FormattedMessage id="ui-users.information.profilePic.modal.saveAndClose" />
      </Button>
    </ModalFooter>
  );

  const onCropComplete = (croppedArea, croppedAreaPxs) => {
    setCroppedAreaPixels(croppedAreaPxs);
  };

  const renderModal = () => {
    return (
      <Modal
        open={open}
        label="Preview and edit"
        footer={footer}
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
              aspect={1 / 1}
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

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
    }}
    >
      {
        imageSrc && open ? renderModal() : (
          <label htmlFor="file-upload">
            <Icon
              icon="profile"
              iconPosition="start"
            >
              <FormattedMessage id="ui-users.information.profilePic.localFile" />
            </Icon>
            <input id="file-upload" type="file" hidden onChange={onFileChange} accept="image/*" />
          </label>
        )
      }
      {
          imageSrc && imageSaved && (
            <img src={croppedImage} alt="profile pic" className={css.profilePic} />
          )
        }
    </div>
  );
};

export default ProfilePicPOC1;
