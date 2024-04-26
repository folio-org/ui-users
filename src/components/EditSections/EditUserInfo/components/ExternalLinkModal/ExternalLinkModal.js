import React,
{
  useEffect,
  useRef,
  useState
} from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  ModalFooter,
  TextField,
} from '@folio/stripes/components';
import { FormattedMessage } from 'react-intl';
import { isAValidURL, isAValidImageUrl } from '../../../../util';

const ExternalLinkModal = ({
  open,
  onClose,
  onSave,
  profilePictureLink
}) => {
  const [inputValue, setInputValue] = useState('');
  const previousInputValue = useRef(profilePictureLink);
  const [disabled, setDisabled] = useState(false);
  const [externalURLValidityError, setExternalURLValidityError] = useState(null);

  useEffect(() => {
    setInputValue(profilePictureLink);
  }, [profilePictureLink]);

  useEffect(() => {
    if (inputValue) {
      setDisabled(previousInputValue.current === inputValue);
    } else {
      setDisabled(true);
      setExternalURLValidityError(null);
    }
  }, [inputValue]);

  const handleSave = async () => {
    setExternalURLValidityError(null);
    if (!inputValue) return;

    if (!isAValidURL(inputValue)) {
      setExternalURLValidityError(<FormattedMessage id="ui-users.information.profilePicture.externalLink.modal.externalURL.invalidURLErrorMessage" />);
      setDisabled(true);
      return;
    }

    const isValidImgURL = await isAValidImageUrl(inputValue);
    if (!isValidImgURL) {
      setExternalURLValidityError(<FormattedMessage id="ui-users.information.profilePicture.externalLink.modal.externalURL.invalidImageURLErrorMessage" />);
      setDisabled(true);
      return;
    }
    onSave(inputValue);
  };

  const handleInputChange = (e) => {
    setExternalURLValidityError(null);
    previousInputValue.current = inputValue;
    setInputValue(e.target.value);
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
        error={externalURLValidityError}
        onChange={handleInputChange}
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
