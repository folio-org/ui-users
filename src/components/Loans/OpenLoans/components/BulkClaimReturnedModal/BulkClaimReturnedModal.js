import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Button,
  Icon,
  Layout,
  Modal,
} from '@folio/stripes-components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

class BulkClaimReturnedModal extends React.Component {

  render() {
    const { open } = this.props;

    return (
      <Modal
        dismissible
        open={open}
        onCancel={() => {}}
        label="Test"
      >
        Test content
      </Modal>
    );
  }
}

export default BulkClaimReturnedModal;