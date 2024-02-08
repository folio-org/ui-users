import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Button,
  Modal,
  ModalFooter,
} from '@folio/stripes/components';

import { USER_TYPES } from '../../../../../constants';

const ChangeUserTypeModal = ({ onChange, initialUserType, open }) => {
  const userTypeModalFooter = (
    <ModalFooter>
      <Button
        id="userType-modal-btn"
        onClick={() => onChange(USER_TYPES.PATRON)}
      >
        <FormattedMessage id="ui-users.information.change.userType.modal.confirm" />
      </Button>
      <Button
        id="userType-modal-cancel-btn"
        onClick={() => onChange(initialUserType)}
      >
        <FormattedMessage id="ui-users.cancel" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      footer={userTypeModalFooter}
      id="userType_confirmation_modal"
      label={<FormattedMessage id="ui-users.information.change.userType.modal.label" />}
      open={open}
    >
      <div>
        <FormattedMessage id="ui-users.information.change.userType.modal.text" />
      </div>
    </Modal>
  );
};

ChangeUserTypeModal.propTypes = {
  onChange: PropTypes.func.isRequired,
  initialUserType: PropTypes.string.isRequired,
  open: PropTypes.bool,
};

ChangeUserTypeModal.defaultProps = {
  open: false,
};

export default ChangeUserTypeModal;
