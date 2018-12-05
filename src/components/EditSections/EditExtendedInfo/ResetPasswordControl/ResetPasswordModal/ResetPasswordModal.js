import React from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';

import {
  Row,
  Col,
  Modal,
  Button,
} from '@folio/stripes/components';

import css from './ResetPasswordModal.css';

class ResetPasswordModal extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    email: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.copyInput = React.createRef();
  }

  buildTextContent = () => {
    const {
      email,
      name,
    } = this.props;

    return (
      <React.Fragment>
        <FormattedMessage id="ui-users.extended.resetPasswordModal.linkWasSent" />
        <p className={css.email}>
          {email}
        </p>
        <FormattedMessage
          id="ui-users.extended.resetPasswordModal.linkInstructions"
          values={{ name }}
        />
      </React.Fragment>
    );
  }

  handleClick = () => {
    this.copyInput.current.select();
    document.execCommand('copy');
  }

  buildCopyLinkControl = () => {
    const { link } = this.props;

    return (
      <Row className={css.copyControl}>
        <Col xs={9}>
          <input
            className={css.textField}
            ref={this.copyInput}
            type="text"
            value={link}
            readOnly
          />
        </Col>
        <Col xs={3}>
          <Button
            buttonStyle="primary"
            onClick={this.handleClick}
          >
            <strong>
              <FormattedMessage id="ui-users.extended.resetPasswordModal.copyLink" />
            </strong>
          </Button>
        </Col>
      </Row>
    );
  }

  render() {
    const {
      isOpen,
      onClose,
    } = this.props;

    return (
      <Modal
        dismissible
        size="small"
        open={isOpen}
        label={<FormattedMessage id="ui-users.extended.resetPasswordModal.label" />}
        onClose={onClose}
      >
        {this.buildTextContent()}
        {this.buildCopyLinkControl()}
      </Modal>
    );
  }
}

export default ResetPasswordModal;
