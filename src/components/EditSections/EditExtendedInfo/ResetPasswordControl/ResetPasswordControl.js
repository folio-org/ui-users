import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  KeyValue,
} from '@folio/stripes/components';

import ResetPasswordModal from './ResetPasswordModal';

import css from './ResetPasswordControl.css';

class ResetPasswordControl extends React.Component {
  static propTypes = {
    email: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    mutator: PropTypes.shape({
      resetPassword: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

  static manifest = Object.freeze({
    resetPassword: {
      type: 'okapi',
      path: 'bl-users/password-reset/link',
      fetch: false,
      throwErrors: false,
    },
  });

  state = {
    showModal: false,
    link: '',
  }

  closeModal = () => {
    this.setState({ showModal: false });
  }

  handleSuccessResponse = ({ link }) => {
    this.setState({
      link,
      showModal: true,
    });
  };

  handleResetPasswordClick = () => {
    const {
      mutator: {
        resetPassword,
      },
      userId,
    } = this.props;

    resetPassword
      .POST({ userId })
      .then(this.handleSuccessResponse)
      .catch(this.closeModal);
  }

  render() {
    const {
      email,
      name,
    } = this.props;

    const {
      link,
      showModal,
    } = this.state;

    const fieldLabel = <FormattedMessage id="ui-users.extended.folioPassword" />;
    const contentText = <FormattedMessage id="ui-users.extended.sendResetPassword" />;

    return (
      <Col
        xs={12}
        md={3}
      >
        <KeyValue label={fieldLabel}>
          <button
            type="button"
            className={css.resetPasswordButton}
            onClick={this.handleResetPasswordClick}
          >
            {contentText}
          </button>
        </KeyValue>
        <ResetPasswordModal
          isOpen={showModal}
          email={email}
          name={name}
          link={link}
          onClose={this.closeModal}
        />
      </Col>
    );
  }
}

export default ResetPasswordControl;
