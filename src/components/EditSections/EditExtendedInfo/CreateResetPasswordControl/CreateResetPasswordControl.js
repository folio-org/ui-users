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
      keycloakUser: PropTypes.shape({
        GET: PropTypes.func,
        POST: PropTypes.func,
      }),
    }).isRequired,
    disabled: PropTypes.bool,
    stripes: PropTypes.object.isRequired,
  };

  static manifest = Object.freeze({
    resetPassword: {
      type: 'okapi',
      path: (queryParams, pathComponents, resourceData, config, props) => {
        if (props.stripes.hasInterface('users-keycloak')) {
          return 'users-keycloak/password-reset/link';
        }
        return 'bl-users/password-reset/link';
      },
      fetch: false,
      throwErrors: false,
    },
    keycloakUser: {
      type: 'okapi',
      path: (queryParams, pathComponents, resourceData, config, props) => {
        return `users-keycloak/auth-users/${props.userId}`;
      },
      accumulate: true,
      fetch: true,
      throwErrors: false,
    }
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
        keycloakUser,
      },
      stripes,
      userId,
    } = this.props;

    if (stripes.hasInterface('users-keycloak')) {
      keycloakUser
        .GET()
        .catch((error) => {
          // If user not found in keycloak, then create record before resetting password.
          if (error.httpStatus === 404) {
            keycloakUser.POST({ userId })
              .then(this.handleResetPassword());
          }
        });
    }

    this.handleResetPassword();
  };

  handleResetPassword = () => {
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
    const { disabled } = this.props;

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
          disabled={disabled}
        >
          <FormattedMessage id="ui-users.extended.sendResetPassword" />
        </button>
        {this.resetPasswordModal()}
      </Col>
    );
  }
}

export default stripesConnect(CreateResetPasswordControl);
