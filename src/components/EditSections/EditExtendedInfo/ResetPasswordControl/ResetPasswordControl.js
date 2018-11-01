import React from 'react';
import PropTypes from 'prop-types';

import {
  injectIntl,
  intlShape,
} from 'react-intl';

import {
  Col,
  KeyValue,
} from '@folio/stripes/components';

import ResetPasswordModal from './ResetPasswordModal';

import css from './ResetPasswordControl.css';

class ResetPasswordControl extends React.Component {
  state = {
    showModal: false,
  }

  openModal = () => {
    this.setState({ showModal: true });
  }

  closeModal = () => {
    this.setState({ showModal: false });
  }

  render() {
    const {
      intl,
      email,
      name,
    } = this.props;

    const fieldLabel = intl.formatMessage({ id: 'ui-users.extended.folioPassword' });
    const contentText = intl.formatMessage({ id: 'ui-users.extended.sendResetPassword' });

    return (
      <Col
        xs={12}
        md={3}
      >
        <KeyValue label={fieldLabel}>
          <button
            type="button"
            className={css.resetPasswordButton}
            onClick={this.openModal}
          >
            {contentText}
          </button>
        </KeyValue>
        <ResetPasswordModal
          isOpen={this.state.showModal}
          email={email}
          name={name}
          intl={intl}
          onClose={this.closeModal}
        />
      </Col>
    );
  }
}

ResetPasswordControl.propTypes = {
  intl: intlShape.isRequired,
  email: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default injectIntl(ResetPasswordControl);
