import Webcam from 'react-webcam';
import { useRef, useState, useCallback, useEffect } from 'react';
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

const videoConstraints = {
  // width: { min: 200 },
  // height: { min: 200 },
  aspectRatio: 1,
  audio: false,
  // video: { width: 200, height: 200 }
};
const DEFAULT_ZOOM = 1;

const WebCamModal = ({ open, rotation, setRotation, onClose }) => {
  const [mirrored, setMirrored] = useState(false);
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [devices, setDevices] = useState([]);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
  };

  const handleDevices = useCallback(
    mediaDevices => setDevices(mediaDevices.filter(({ kind }) => kind === 'videoinput')),
    [setDevices]
  );

  useEffect(
    () => {
      navigator.mediaDevices.enumerateDevices().then(handleDevices);
    },
    [handleDevices]
  );

  const onCropComplete = (croppedArea, croppedAreaPxs) => {
    setCroppedAreaPixels(croppedAreaPxs);
  };

  const renderFooter = useCallback(() => {
    return (
      <ModalFooter>
        <Button
          buttonStyle="primary"
          id="save-local-file-btn"
          // onClick={handleSaveProfilePictureLocalFile}
        >
          <FormattedMessage id="stripes-components.saveAndClose" />
        </Button>
        <Button
          onClick={onClose}
        >
          <FormattedMessage id="stripes-core.button.cancel" />
        </Button>
      </ModalFooter>
    );
  }, []);

  return (
    <Modal
      open={open}
      size="medium"
      // label={<FormattedMessage id="ui-users.information.profilePicture.localFile.modal.previewAndEdit" />}
      label="web cam modal"
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
        ) : (
          <Webcam
            height={600}
            width={600}
            videoConstraints={videoConstraints}
            ref={webcamRef}
            mirrored={mirrored}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.8}
            onUserMediaError={(MediaStreamError) => alert('error ', MediaStreamError)}
          />
        )}
        <div className="controls">
          {!imgSrc && (
            <div>
              <input
                type="checkbox"
                checked={mirrored}
                onChange={(e) => setMirrored(e.target.checked)}
              />
              <label>Mirror</label>
            </div>
          )}
        </div>
        <div className="btn-container">
          {imgSrc ? (
            <button onClick={retake}>Retake photo</button>
          ) : (
            <button onClick={capture}>Capture photo</button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default WebCamModal;
