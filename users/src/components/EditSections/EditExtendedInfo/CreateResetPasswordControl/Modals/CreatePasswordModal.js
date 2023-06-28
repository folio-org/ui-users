import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Layout,
} from '@folio/stripes/components';

import withCopyModal from './WithCopyModal';

const CreatePasswordModalBody = ({ email }) => {
  return (
    <>
      <FormattedMessage id="ui-users.extended.createPasswordModal.linkWasSent" />
      <Layout className="padding-all-gutter">
        <strong>{email}</strong>
      </Layout>
      <FormattedMessage id="ui-users.extended.createPasswordModal.linkInstructions" />
    </>
  );
};

CreatePasswordModalBody.propTypes = {
  email: PropTypes.string.isRequired,
};

export default withCopyModal(CreatePasswordModalBody);
