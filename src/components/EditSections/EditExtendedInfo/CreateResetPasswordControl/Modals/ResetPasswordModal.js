import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Row,
  Col,
} from '@folio/stripes/components';

import withCopyModal from './WithCopyModal';
import css from './PasswordModal.css';

const ResetPasswordModalBody = ({
  email,
  name,
}) => {
  return (
    <>
      <FormattedMessage id="ui-users.extended.resetPasswordModal.linkWasSent" />
      <Row>
        <Col
          xs={12}
          className={css.emailText}
        >
          {email}
        </Col>
      </Row>
      <FormattedMessage
        id="ui-users.extended.resetPasswordModal.linkInstructions"
        values={{ name }}
      />
    </>
  );
};

ResetPasswordModalBody.propTypes = {
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
};

export default withCopyModal(ResetPasswordModalBody);
