import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  ModalFooter,
  TextField,
} from '@folio/stripes/components';
import { FormattedMessage } from 'react-intl';
import { isAValidImageURL } from '../../../../util';

const ExternalLinkModal = ({ open, onClose, onSave, profilePictureLink }) => {
  const [inputValue, setInputValue] = useState('');
  const previousInputValue = useRef(profilePictureLink);
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setInputValue(profilePictureLink);
    setError(false);
  }, [profilePictureLink]);

  useEffect(() => {
    if (inputValue) {
      setDisabled(previousInputValue.current === inputValue);
      setError(false);
    } else {
      setDisabled(true);
    }
  }, [inputValue]);

  const handleSave = () => {
    onSave(inputValue);
  };

  const handleInputChange = (e) => {
    previousInputValue.current = inputValue;
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    if (inputValue && !isAValidImageURL(inputValue)) {
      setError(true);
    }
  };

  const renderModalFooter = () => {
    return (
      <ModalFooter>
        <Button
          buttonStyle="primary"
          id="save-external-link-btn"
          disabled={disabled}
          onClick={handleSave}
        >
          <FormattedMessage id="ui-users.save" />
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
      size="small"
      open={open}
      label={<FormattedMessage id="ui-users.information.profilePicture.externalLink.modal.updateProfilePicture" />}
      onClose={onClose}
      footer={renderModalFooter()}
    >
      <TextField
        name="external-image-url"
        id="external-image-url"
        label={<FormattedMessage id="ui-users.information.profilePicture.externalLink.modal.externalURL" />}
        error={error && <FormattedMessage id="ui-users.information.profilePicture.externalLink.modal.externalURL.errorMessage" />}
        onChange={handleInputChange}
        onBlur={handleBlur}
        value={inputValue}
        hasClearIcon={false}
      />
    </Modal>
  );
};

ExternalLinkModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  profilePictureLink: PropTypes.string,
};

export default ExternalLinkModal;
