import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import moment from 'moment';

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

import { MAX_RECORDS } from '../../constants';

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
    cancel: {
      type: 'okapi',
      path: 'accounts/%{activeRecord.id}/cancel',
      fetch: false,
      clientGeneratePk: false,
    },
    activeRecord: {},
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
      cancel: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      })
    }).isRequired,
    /*resources: PropTypes.shape({
      accountActions: PropTypes.object,
      accounts: PropTypes.object.isRequired,
      feefineactions: PropTypes.object.isRequired,
      loans: PropTypes.object.isRequired,
    }),*/
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
    validateAction: PropTypes.func,
    itemRequestCount: PropTypes.number.isRequired,
    activeRecord: PropTypes.object,
  };

  static defaultProps = {
    disableButton: () => {},
  };

  constructor(props) {
    super(props);
    this.validateAction = this.props.validateAction;
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
      resources,
      stripes: {
        user: {
          user: {
            curServicePoint,
          },
        },
      },
    } = this.props;
    console.log(this.props);
    
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
      this.validateAction();
    }

    if (loanAction === loanActionMutators.DECLARE_LOST) {
      requestData.servicePointId = curServicePoint?.id;
      requestData.declaredLostDateTime = new Date().toISOString();
    }

    const accounts = _.get(resources, ['accounts', 'records'], []);

    console.log(accounts);

    await this.addFeeFine(loanAction, "819dabe1-910d-4dad-a1d4-f14e36b7c93c", additionalInfo, this.props.loan.feesAndFines.amountRemainingToPay);

    if(loanAction === loanActionMutators.MARK_AS_MISSING) {
      
    }

    if(loanAction === loanActionMutators.DECLARE_LOST) {

    }

    //disableButton();
    try {
      console.log("Entro al click");
      console.log(requestData);
      console.log(loanAction);

      //await POST(requestData);
    } catch (error) {
      //this.processError(error);
    }

    //onClose();
  };

  addFeeFine(loanAction, accountId, additionalInfo, amount) {

    const {
      mutator,
      intl: { formatMessage },
    } = this.props;

    mutator.activeRecord.update({ id: accountId });
    
    const {
      okapi: {
        currentUser: {
          firstName = '',
          lastName = '',
          curServicePoint: { id: servicePointId }
        },
      }
    } = this.props;

    const body = {};

    //body.amount = amount;
    body.notifyPatron = false;
    body.comments = additionalInfo
    body.servicePointId = servicePointId;
    body.userName = `${lastName}, ${firstName}`;
    
    mutator.cancel.POST(body)

    /*const createAt = new Date().toISOString();
    const newAction = {
      typeAction: {},
      source: `${this.props.okapi.currentUser.lastName}, ${this.props.okapi.currentUser.firstName}`,
      createdAt: createAt,
      accountId,
      dateAction: moment().format(),
      userId: this.props.loan.userId,
      amountAction: parseFloat(amount || 0).toFixed(2),
      balance: parseFloat(0).toFixed(2),
      transactionInformation: '-',
      comments: additionalInfo,
      notify: ''
    };
    console.log();
    return this.props.mutator.cancel.POST(Object.assign(loanAction, newAction));*/
  }

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

    console.log(this.props);

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
