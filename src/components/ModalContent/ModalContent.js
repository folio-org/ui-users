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

import { loanActions } from '../../constants';

import css from './ModalContent.css';

class ModalContent extends React.Component {
  static manifest = Object.freeze({
    claimReturned: {
      type: 'okapi',
      fetch: false,
      POST: {
        path: 'circulation/loans/!{loan.id}/claim-item-returned',
      },
    },
    declareLost: {
      type: 'okapi',
      fetch: false,
      POST: {
        path: 'circulation/loans/!{loan.id}/declare-item-lost',
      },
    },
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
      claimReturned: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
      declareLost: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
      markAsMissing: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    stripes: PropTypes.shape({
      user: PropTypes.shape({
        user: PropTypes.object,
      }).isRequired,
    }).isRequired,
    loanAction: PropTypes.string.isRequired,
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

  submit = async () => {
    const { additionalInfo } = this.state;

    const {
      loanAction,
      stripes: {
        user: {
          user: {
            curServicePoint,
          },
        },
      },
    } = this.props;

    const {
      mutator: {
        [loanAction]: {
          POST,
        },
      },
      onClose,
    } = this.props;

    const requestData = { comment: additionalInfo };

    if (loanAction === loanActions.CLAIMED_RETURNED) {
      requestData.itemClaimedReturnedDateTime = new Date().toISOString();
    }

    if (loanAction === loanActions.DECLARE_LOST) {
      requestData.servicePointId = curServicePoint?.id;
      requestData.declaredLostDateTime = new Date().toISOString();
    }

    await POST(requestData);

    onClose();
  };

  render() {
    const {
      loan,
      loanAction,
      onClose,
    } = this.props;

    const { additionalInfo } = this.state;

    return (
      <div>
        <Layout className="flex">
          <Layout className="flex">
            <SafeHTMLMessage
              id={`ui-users.loans.${loanAction}DialogBody`}
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
              data-test-additional-info-textarea
              label={<FormattedMessage id="ui-users.additionalInfo.label" />}
              required
              onChange={this.handleAdditionalInfoChange}
            />
          </Col>
        </Row>
        <Layout className="textRight">
          <Button
            data-test-dialog-cancel-button
            onClick={onClose}
          >
            <FormattedMessage id="ui-users.cancel" />
          </Button>
          <Button
            data-test-dialog-confirm-button
            buttonStyle="primary"
            disabled={!additionalInfo}
            onClick={this.submit}
          >
            <FormattedMessage id="ui-users.confirm" />
          </Button>
        </Layout>
      </div>
    );
  }
}

export default stripesConnect(ModalContent);
