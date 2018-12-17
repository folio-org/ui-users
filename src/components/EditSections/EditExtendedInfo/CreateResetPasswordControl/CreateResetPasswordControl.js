import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';

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
        records: PropTypes.object,
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
    return (
      <CreatePasswordModal
        isOpen={this.state.showModal}
        link={this.state.link}
        email={this.props.email}
        modalHeader={<FormattedMessage id="ui-users.extended.createPasswordModal.label" />}
        onClose={this.closeModal}
      />
    );
  };

  resetPasswordModal = () => {
    return (
      <ResetPasswordModal
        isOpen={this.state.showModal}
        link={this.state.link}
        email={this.props.email}
        name={this.props.name}
        modalHeader={<FormattedMessage id="ui-users.extended.resetPasswordModal.label" />}
        onClose={this.closeModal}
      />
    );
  };

  render() {
    const pathToResponse = 'resources.isLocalPasswordSet.records.credentialsExist';
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

export default CreateResetPasswordControl;
