import Webcam from 'react-webcam';
import { useRef, useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { FormattedMessage } from 'react-intl';

import {
  Button,
  Modal,
  ModalFooter,
  Row,
  Col,
} from '@folio/stripes/components';

import { getCroppedImg, createImage } from '../EditUserProfilePicture/utils/canvasUtils';
import Slider from '../LocalFileModal/components/Slider';

import css from '../LocalFileModal/LocalFileModal.css';

const DEFAULT_ROTATION = 0;
const DEFAULT_ZOOM = 1;
const DEFAULT_CROP = { x: 0, y: 0 };

const WebcamModal = ({
  open,
  onClose,
  onSave,
}) => {
  const [imgSrc, setImgSrc] = useState(null);
  const [rotation, setRotation] = useState(DEFAULT_ROTATION);
  const [crop, setCrop] = useState(DEFAULT_CROP);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    setImgSrc(webcamRef?.current?.getScreenshot());
  }, [webcamRef]);

  const reset = () => {
    setZoom(DEFAULT_ZOOM);
    setRotation(DEFAULT_ROTATION);
    setCrop(DEFAULT_CROP);
    setCroppedAreaPixels(null);
    setImgSrc(null);
  };

  const onCropComplete = (_, croppedPxs) => {
    setCroppedAreaPixels(croppedPxs);
  };

  const handleSave = useCallback(async () => {
    await onSave(await getCroppedImg(await createImage(imgSrc), croppedAreaPixels, rotation));
    reset();
    onClose();
  }, [croppedAreaPixels, imgSrc, onClose, onSave, rotation]);

  const renderFooter = useCallback(() => {
    return (
      <ModalFooter>
        <Button
          buttonStyle="primary"
          disabled={!imgSrc}
          onClick={handleSave}
        >
          <FormattedMessage id="stripes-components.saveAndClose" />
        </Button>
        <Button
          style={{ marginLeft: 'auto', marginRight: '1rem' }}
          onClick={imgSrc ? reset : capture}
        >
          <FormattedMessage id={imgSrc ? 'ui-users.information.profilePicture.retakePhoto' : 'ui-users.information.profilePicture.takePhoto'} />
        </Button>
        <Button
          onClick={onClose}
        >
          <FormattedMessage id="stripes-core.button.cancel" />
        </Button>
      </ModalFooter>
    );
  }, [capture, handleSave, imgSrc, onClose]);

  return (
    <Modal
      open={open}
      size="medium"
      label={<FormattedMessage id="ui-users.information.profilePicture.takePhoto" />}
      footer={renderFooter()}
    >
      <div>
        {imgSrc ? (
          <div className={css.modalBodyContainer}>
            <div
              className={css.cropContainer}
            >
              <Cropper
                image={imgSrc}
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
          </div>
        ) : (
          <div className={css.videoFeedContainer}>
            <Webcam
              ref={webcamRef}
              mirrored
              videoConstraints={{
                aspectRatio: 1,
                audio: false,
              }}
              height={300}
              width={300}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.8}
            />
          </div>
        )}
        <Row>
          <Col xs={4}>
            <Slider
              value={zoom}
              min={1}
              max={5}
              step={0.1}
              handleChange={({ target: { value } }) => setZoom(Number(value))}
              label="zoom"
              disabled={!imgSrc}
            />
          </Col>
          <Col xs={4}>
            <Slider
              value={rotation}
              min={0}
              max={360}
              step={1}
              handleChange={({ target: { value } }) => setRotation(Number(value))}
              label="rotate"
              disabled={!imgSrc}
            />
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default WebcamModal;
