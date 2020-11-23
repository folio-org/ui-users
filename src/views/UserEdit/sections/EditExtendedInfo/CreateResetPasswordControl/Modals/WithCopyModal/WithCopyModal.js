import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';

import {
  Row,
  Col,
  Modal,
  Button,
  TextField
} from '@folio/stripes/components';

import css from './WithCopyModal.css';

function withCopyModal(WrappedComponent) {
  return class extends Component {
    static propTypes = {
      isOpen: PropTypes.bool.isRequired,
      link: PropTypes.string.isRequired,
      modalHeader: PropTypes.node.isRequired,
      onClose: PropTypes.func.isRequired,
    };

    constructor(props) {
      super(props);

      this.copyInput = React.createRef();
    }

    handleClick = () => {
      this.copyInput.current.select();
      document.execCommand('copy');
    };

    render() {
      const {
        isOpen,
        link,
        onClose,
        modalHeader,
      } = this.props;

      return (
        <Modal
          dismissible
          size="small"
          open={isOpen}
          label={modalHeader}
          onClose={onClose}
        >
          <WrappedComponent {...this.props} />
          <Row className={css.copyControl}>
            <Col xs={9}>
              <TextField
                hasClearIcon={false}
                inputRef={this.copyInput}
                value={link}
                readOnly
              />
            </Col>
            <Col xs={3}>
              <Button
                buttonStyle="primary"
                onClick={this.handleClick}
              >
                <FormattedMessage id="ui-users.extended.copyLink" />
              </Button>
            </Col>
          </Row>
        </Modal>
      );
    }
  };
}

export default withCopyModal;
