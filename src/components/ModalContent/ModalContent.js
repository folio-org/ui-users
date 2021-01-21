import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import {
  Button,
  Layout,
  TextArea,
  Row,
  Col,
} from '@folio/stripes/components';
import { stripesConnect } from '@folio/stripes/core';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import { getOpenRequestsPath } from '../util';

import { loanActionMutators } from '../../constants';

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
      throwErrors: false,
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
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
    loanAction: PropTypes.string.isRequired,
    loan: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    handleError: PropTypes.func.isRequired,
    disableButton: PropTypes.func,
    itemRequestCount: PropTypes.number.isRequired,
  };

  static defaultProps = {
    disableButton: () => {},
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
      disableButton,
    } = this.props;

    const requestData = { comment: additionalInfo };

    if (loanAction === loanActionMutators.CLAIMED_RETURNED) {
      requestData.itemClaimedReturnedDateTime = new Date().toISOString();
    }

    if (loanAction === loanActionMutators.DECLARE_LOST) {
      requestData.servicePointId = curServicePoint?.id;
      requestData.declaredLostDateTime = new Date().toISOString();
    }

    disableButton();

    try {
      await POST(requestData);
    } catch (error) {
      this.processError(error);
    }

    onClose();
  };

  processError(resp) {
    const { handleError } = this.props;

    const contentType = resp.headers.get('Content-Type') || '';

    if (contentType.startsWith('application/json')) {
      resp.json().then(error => handleError(error.errors[0].message));
    } else {
      resp.text().then(handleError);
    }
  }

  render() {
    const {
      stripes,
      loan,
      loanAction,
      onClose,
      itemRequestCount,
    } = this.props;

    const { additionalInfo } = this.state;

    const openRequestValue = <Link to={getOpenRequestsPath(loan.itemId)}>{`${itemRequestCount} open request${itemRequestCount === 1 ? '' : 's'}`}</Link>;

    // The countIndex variable is used here for:
    //  - either to determine the content of the message about open requests
    //  - or whether to show this message at all.
    const countIndex = stripes.hasPerm('ui-users.requests.all') ? itemRequestCount : -1;

    return (
      <div>
        <SafeHTMLMessage
          id={`ui-users.loans.${loanAction}DialogBody`}
          values={{
            title: loan?.item?.title,
            materialType: loan?.item?.materialType?.name,
            barcode: loan?.item?.barcode,
            openRequestValue,
            countIndex,
          }}
        />
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
