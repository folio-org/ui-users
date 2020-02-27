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

import css from './ClaimReturnedDialog.css';

class ClaimReturnedInfo extends React.Component {
  static manifest = Object.freeze({
    claimReturned: {
      type: 'okapi',
      fetch: false,
      POST: {
        path: 'circulation/loans/!{loan.id}/claim-item-returned',
      },
    },
  });

  static propTypes = {
    mutator: PropTypes.shape({
      claimReturned: PropTypes.shape({
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

  submitClaimReturned = async () => {
    const { additionalInfo } = this.state;

    const {
      mutator: {
        claimReturned: {
          POST,
        }
      },
      onClose,
    } = this.props;

    await POST({
      itemClaimedReturnedDateTime: new Date().toISOString(),
      comment: additionalInfo,
    });

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
              id="ui-users.loans.claimReturnedDialogBody"
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
              data-test-claim-returned-additional-info-textarea
              label={<FormattedMessage id="ui-users.additionalInfo.label" />}
              required
              onChange={this.handleAdditionalInfoChange}
            />
          </Col>
        </Row>
        <Layout className="textRight">
          <Button
            data-test-claim-returned-dialog-cancel-button
            onClick={onClose}
          >
            <FormattedMessage id="ui-users.cancel" />
          </Button>
          <Button
            data-test-claim-returned-dialog-confirm-button
            buttonStyle="primary"
            disabled={!additionalInfo}
            onClick={this.submitClaimReturned}
          >
            <FormattedMessage id="ui-users.confirm" />
          </Button>
        </Layout>
      </div>
    );
  }
}

export default stripesConnect(ClaimReturnedInfo);
