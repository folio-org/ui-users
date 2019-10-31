import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';
import { stripesConnect } from '@folio/stripes/core';
import {
  Col,
  KeyValue,
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
      isLocalPasswordSet: PropTypes.shape({
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
    isLocalPasswordSet: {
      type: 'okapi',
      path: 'authn/credentials-existence?userId=!{userId}',
      permissionsRequired: 'login.credentials-existence.get',
    },
  });

  state = {
    showModal: false,
    link: '',
  };

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
    const pathToResponse = 'resources.isLocalPasswordSet.records[0].credentialsExist';
    const isLocalPasswordSet = get(this.props, pathToResponse, true);

    const linkTextKey = isLocalPasswordSet
      ? 'ui-users.extended.sendResetPassword'
      : 'ui-users.extended.sendCreatePassword';

    const fieldLabel = <FormattedMessage id="ui-users.extended.folioPassword" />;
    const contentText = <FormattedMessage id={linkTextKey} />;

    return (
      <Col
        xs={12}
        md={3}
      >
        <KeyValue label={fieldLabel}>
          <button
            type="button"
            className={css.resetPasswordButton}
            onClick={this.handleLinkClick}
          >
            {contentText}
          </button>
        </KeyValue>
        {isLocalPasswordSet
          ? this.resetPasswordModal()
          : this.createPasswordModal()
        }
      </Col>
    );
  }
}

export default stripesConnect(CreateResetPasswordControl);
