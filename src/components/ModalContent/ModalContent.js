import {
  get,
  noop,
} from 'lodash';
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

import { getOpenRequestsPath } from '../util';

import { loanActionMutators, refundClaimReturned, loanActions } from '../../constants';

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
    feefineshistory: {
      type: 'okapi',
      records: 'accounts',
      GET: {
        path: 'accounts?query=(userId==:{id})&limit=10000',
      },
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
      }),
      feefineshistory: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      activeRecord: PropTypes.object,
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
    declarationInProgress: PropTypes.bool.isRequired,
    isInProgress: PropTypes.bool,
    toggleButton: PropTypes.func,
    validateAction: PropTypes.func,
    itemRequestCount: PropTypes.number.isRequired,
    activeRecord: PropTypes.object,
    user: PropTypes.object,
    resources: PropTypes.object,
    okapi: PropTypes.object
  };

  static defaultProps = {
    toggleButton: noop,
  };

  constructor(props) {
    super(props);
    this.validateAction = this.props.validateAction;
    this.state = {
      additionalInfo: '',
    };
  }

  handleAdditionalInfoChange = event => {
    this.setState({ additionalInfo: event.target.value.trim() });
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
      toggleButton,
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

    if (this.props.loan.action === loanActions.CLAIMED_RETURNED && (loanAction === loanActionMutators.MARK_AS_MISSING || loanAction === loanActionMutators.DECLARE_LOST)) {
      const feeFines = this.getFeeFines(this.props.loan.id);
      feeFines.forEach((feeFine) => {
        this.cancelFeeFine(feeFine.id, additionalInfo);
      });
    }

    toggleButton(true);
    try {
      await POST(requestData);
    } catch (error) {
      this.processError(error);
    }

    toggleButton(false);
    onClose();
  };

  getFeeFines(loanId) {
    const {
      mutator,
      user,
      resources
    } = this.props;

    if (user) {
      mutator.activeRecord.update({ userId: user.id });
    }

    const feeFines = [];
    get(resources, ['feefineshistory', 'records'], []).forEach((currentFeeFine) => {
      if (currentFeeFine.loanId === loanId && currentFeeFine.status.name === 'Open' &&
        (currentFeeFine.feeFineType === refundClaimReturned.LOST_ITEM_FEE || currentFeeFine.feeFineType === refundClaimReturned.LOST_ITEM_PROCESSING_FEE)) {
        feeFines.push(currentFeeFine);
      }
    });
    return feeFines;
  }

  cancelFeeFine = async (accountId, additionalInfo) => {
    const {
      mutator
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

    body.notifyPatron = false;
    body.comments = additionalInfo;
    body.servicePointId = servicePointId;
    body.userName = `${lastName}, ${firstName}`;

    await mutator.cancel.POST(body);
  }

  processError(resp) {
    const { handleError } = this.props;

    const contentType = resp.headers.get('Content-Type') || '';

    if (contentType.startsWith('application/json')) {
      resp.json().then(error => handleError(error?.errors?.[0]?.message));
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
      declarationInProgress,
      isInProgress,
    } = this.props;

    const { additionalInfo } = this.state;

    const openRequestValue = <Link to={getOpenRequestsPath(loan.itemId)}>{`${itemRequestCount} open request${itemRequestCount === 1 ? '' : 's'}`}</Link>;

    // The countIndex variable is used here for:
    //  - either to determine the content of the message about open requests
    //  - or whether to show this message at all.
    const countIndex = stripes.hasPerm('ui-users.requests.all') ? itemRequestCount : -1;
    const isConfirmButtonDisabled = !additionalInfo || isInProgress || declarationInProgress;

    return (
      <div>
        <FormattedMessage
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
            disabled={isConfirmButtonDisabled}
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
