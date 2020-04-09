import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Row,
  Col,
} from '@folio/stripes/components';

import withCopyModal from './WithCopyModal';
import css from './PasswordModal.css';

const CreatePasswordModalBody = ({ email }) => {
  return (
    <>
      <FormattedMessage id="ui-users.extended.createPasswordModal.linkWasSent" />
      <Row>
        <Col
          xs={12}
          className={css.emailText}
        >
          {email}
        </Col>
      </Row>
      <FormattedMessage id="ui-users.extended.createPasswordModal.linkInstructions" />
    </>
  );
};

CreatePasswordModalBody.propTypes = {
  email: PropTypes.string.isRequired,
};

export default withCopyModal(CreatePasswordModalBody);
