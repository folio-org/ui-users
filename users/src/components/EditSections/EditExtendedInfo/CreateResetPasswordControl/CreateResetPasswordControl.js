import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { stripesConnect } from '@folio/stripes/core';
import {
  Col,
  Label,
} from '@folio/stripes/components';

import CreatePasswordModal from './Modals/CreatePasswordModal';
import ResetPasswordModal from './Modals/ResetPasswordModal';

import css from './CreateResetPasswordControl.css';

class CreateResetPasswordControl extends React.Component {
  static propTypes = {
    email: PropTypes.string,
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

  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      link: '',
    };
  }

  closeModal = () => {
    this.setState({ showModal: false });
  };

  handleSuccessResponse = ({ link }) => {
    this.setState({
      link,
      showModal: true,
    });
  };

  handleLinkClick = () => {
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
  };

  createPasswordModal = () => {
    const {
      showModal,
      link,
    } = this.state;

    const { email } = this.props;

    return (
      <CreatePasswordModal
        isOpen={showModal}
        link={link}
        email={email}
        modalHeader={<FormattedMessage id="ui-users.extended.createPasswordModal.label" />}
        onClose={this.closeModal}
      />
    );
  };

  resetPasswordModal = () => {
    const {
      showModal,
      link,
    } = this.state;

    const {
      email,
      name,
    } = this.props;

    return (
      <ResetPasswordModal
        isOpen={showModal}
        link={link}
        email={email}
        name={name}
        modalHeader={<FormattedMessage id="ui-users.extended.resetPasswordModal.label" />}
        onClose={this.closeModal}
      />
    );
  };

  render() {
    return (
      <Col
        xs={12}
        md={6}
      >
        <Label tagName="div">
          <FormattedMessage id="ui-users.extended.folioPassword" />
        </Label>
        <button
          type="button"
          className={css.resetPasswordButton}
          onClick={this.handleLinkClick}
        >
          <FormattedMessage id="ui-users.extended.sendResetPassword" />
        </button>
        {this.resetPasswordModal()}
      </Col>
    );
  }
}

export default stripesConnect(CreateResetPasswordControl);
