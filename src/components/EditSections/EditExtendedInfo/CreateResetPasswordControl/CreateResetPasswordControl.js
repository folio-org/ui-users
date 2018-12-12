import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';

import {
  Col,
  KeyValue,
} from '@folio/stripes/components';

import CreateResetPasswordModal from './CreateResetPasswordModal';

import css from './CreateResetPasswordControl.css';

class CreateResetPasswordControl extends React.Component {
  static propTypes = {
    email: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    resources: PropTypes.shape({
      isLocalPasswordSet: PropTypes.shape({
        // ToDo: should be updated
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
    // ToDo: should be investigated: added new endpoint or flag to existing one
    resetPassword: {
      type: 'okapi',
      path: 'bl-users/password-reset/link',
      fetch: false,
      throwErrors: false,
    },
    // ToDo: should be changed
    isLocalPasswordSet: {
      type: 'okapi',
      path: 'perms/permissions?length=1000',
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
  };

  render() {
    const {
      email,
      name,
    } = this.props;

    const isLocalPasswordSet = get(
      this.props,
      'resources.isLocalPasswordSet.records.isLocalPasswordSet',
      true,
    );

    const {
      link,
      showModal,
    } = this.state;

    const fieldLabel = <FormattedMessage id="ui-users.extended.folioPassword" />;
    const contentText = <FormattedMessage id={`ui-users.extended.${
      isLocalPasswordSet
        ? 'sendCreatePassword'
        : 'sendResetPassword'
    }`}
    />;

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
        <CreateResetPasswordModal
          isLocalPasswordSet={isLocalPasswordSet}
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

export default CreateResetPasswordControl;
