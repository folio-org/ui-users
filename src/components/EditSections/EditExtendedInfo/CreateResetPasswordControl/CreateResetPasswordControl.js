import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { isEmpty } from 'lodash';
// eslint-disable-next-line import/no-extraneous-dependencies
import crypto from 'crypto';

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
    email: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    resources: PropTypes.shape({
      credentials: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }).isRequired,
    }).isRequired,
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
    credentials: {
      type: 'okapi',
      path: 'authn/credentials?query=(userId=!{userId})',
    },
  });

  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      isLocalPasswordSet: false,
      link: '',
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.resources.credentials !== prevProps.resources.credentials) {
      this.checkPasswordExistence();
    }
  }

  checkPasswordExistence = async () => {
    /*
    We need to differ the user WITH setted password from user WITHOUT password.
    When user was created by default setted password is '' (empty string).
    When we edit user, we receive the object with credentials.
    Then we encrypt the '' with received salt from credentials, and if hash is simular,
    then we know that password was not set for the current user yet, then display 'Create password',
    otherwise 'Reset password' link.
    */
    const {
      resources: {
        credentials,
      },
    } = this.props;
    const credentialsRecord = credentials?.records[0]?.credentials[0] ?? {};

    if (isEmpty(credentialsRecord)) {
      return;
    }

    const normalizeSalt = Buffer.from(credentialsRecord.salt, 'hex');

    // '' - password, encrypted with normalizeSalt
    // 1000 - number of iterations
    // 32 - length of derivedKey
    const derivedKey = crypto.pbkdf2Sync('', normalizeSalt, 1000, 32, 'sha1');
    const formattedDerivedKey = derivedKey.toString('hex').toUpperCase();

    if (!formattedDerivedKey.includes(credentialsRecord.hash)) {
      this.setState({ isLocalPasswordSet: true });
    }
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
    const { isLocalPasswordSet } = this.state;
    const linkTextKey = isLocalPasswordSet
      ? 'ui-users.extended.sendResetPassword'
      : 'ui-users.extended.sendCreatePassword';

    return (
      <Col
        xs={12}
        md={3}
      >
        <Label tagName="div">
          <FormattedMessage id="ui-users.extended.folioPassword" />
        </Label>
        <button
          type="button"
          className={css.resetPasswordButton}
          onClick={this.handleLinkClick}
        >
          <FormattedMessage id={linkTextKey} />
        </button>
        {isLocalPasswordSet
          ? this.resetPasswordModal()
          : this.createPasswordModal()
        }
      </Col>
    );
  }
}

export default stripesConnect(CreateResetPasswordControl);
