import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { omit } from 'lodash';

import {
  Button,
  Modal,
  ModalFooter,
} from '@folio/stripes/components';

const ErrorModal = (props) => {
  const modalProps = omit(props, ['confirmButtonText']);
  const footer = (
    <ModalFooter>
      <Button
        data-testid="confirmButton"
        buttonStyle="primary"
        onClick={props.onClose}
      >
        {
          props.confirmButtonText
            ? props.confirmButtonText
            : <FormattedMessage id="ui-users.okay" />
        }
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      data-testid="errorModal"
      data-test-error-modal
      size="small"
      footer={footer}
      dismissible
      {...modalProps}
    >
      <p>{props.message}</p>
    </Modal>
  );
};

ErrorModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  confirmButtonText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  id: PropTypes.string,
};

export default ErrorModal;
