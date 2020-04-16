import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Button,
  Layout,
  TextArea,
  Row,
  Col,
} from '@folio/stripes/components';
import { stripesConnect } from '@folio/stripes/core';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import css from './MarkAsMissingDialog.css';

class MarkAsMissingInfo extends React.Component {
  static manifest = Object.freeze({
    markAsMissing: {
      type: 'okapi',
      fetch: false,
      POST: {
        path: 'circulation/loans/!{loan.id}/declare-claimed-returned-item-as-missing',
      },
    },
  });

  static propTypes = {
    mutator: PropTypes.shape({
      markAsMissing: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    loan: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      additionalInfo: '',
    };
  }

  handleAdditionalInfoChange = event => {
    this.setState({ additionalInfo: event.target.value });
  };

  submitMarkAsMissing = async () => {
    const { additionalInfo } = this.state;

    const {
      mutator: {
        markAsMissing: {
          POST,
        }
      },
      onClose,
    } = this.props;

    await POST({ comment: additionalInfo });

    onClose();
  };

  render() {
    const {
      loan,
      onClose,
    } = this.props;

    const { additionalInfo } = this.state;

    return (
      <div>
        <Layout className="flex">
          <Layout className="flex">
            <SafeHTMLMessage
              id="ui-users.loans.markAsMissingDialogBody"
              values={{
                title: loan?.item?.title,
                materialType: loan?.item?.materialType?.name,
                barcode: loan?.item?.barcode,
              }}
            />
          </Layout>
        </Layout>
        <Row>
          <Col sm={12} className={css.additionalInformation}>
            <TextArea
              data-test-mark-as-missing-additional-info-textarea
              label={<FormattedMessage id="ui-users.additionalInfo.label" />}
              required
              onChange={this.handleAdditionalInfoChange}
            />
          </Col>
        </Row>
        <Layout className="textRight">
          <Button
            data-test-mark-as-missing-dialog-cancel-button
            onClick={onClose}
          >
            <FormattedMessage id="ui-users.cancel" />
          </Button>
          <Button
            data-test-mark-as-missing-dialog-confirm-button
            buttonStyle="primary"
            disabled={!additionalInfo}
            onClick={this.submitMarkAsMissing}
          >
            <FormattedMessage id="ui-users.confirm" />
          </Button>
        </Layout>
      </div>
    );
  }
}

export default stripesConnect(MarkAsMissingInfo);
