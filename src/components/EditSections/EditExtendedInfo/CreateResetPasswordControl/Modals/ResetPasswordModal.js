import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Row,
  Col,
} from '@folio/stripes/components';

import withCopyModal from './WithCopyModal';

const ResetPasswordModalBody = ({ email, name }) => {
  return (
    <Fragment>
      <FormattedMessage id="ui-users.extended.resetPasswordModal.linkWasSent" />
      <Row>
        <Col
          xs={12}
          style={{ fontWeight: 'bold', padding: '10px' }}
        >
          {email}
        </Col>
      </Row>
      <FormattedMessage
        id="ui-users.extended.resetPasswordModal.linkInstructions"
        values={{ name }}
      />
    </Fragment>
  );
};

ResetPasswordModalBody.propTypes = {
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
};

export default withCopyModal(ResetPasswordModalBody);
