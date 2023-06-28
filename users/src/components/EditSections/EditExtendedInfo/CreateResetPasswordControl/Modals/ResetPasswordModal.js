import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Layout,
} from '@folio/stripes/components';

import withCopyModal from './WithCopyModal';

const ResetPasswordModalBody = ({
  email,
  name,
}) => {
  return (
    <>
      <FormattedMessage id="ui-users.extended.resetPasswordModal.linkWasSent" />
      <Layout className="padding-all-gutter">
        <strong>{email}</strong>
      </Layout>
      <FormattedMessage
        id="ui-users.extended.resetPasswordModal.linkInstructions"
        values={{ name }}
      />
    </>
  );
};

ResetPasswordModalBody.propTypes = {
  name: PropTypes.string.isRequired,
  email: PropTypes.string,
};

export default withCopyModal(ResetPasswordModalBody);
