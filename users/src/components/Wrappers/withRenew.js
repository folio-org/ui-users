import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  isEmpty,
} from 'lodash';

import { Callout } from '@folio/stripes/components';

import BulkRenewalDialog from '../BulkRenewalDialog';
import isOverridePossible from '../Loans/OpenLoans/helpers/isOverridePossible';
import {
  MAX_RECORDS,
  OVERRIDE_BLOCKS_FIELDS,
  requestStatuses,
} from '../../constants';

// HOC used to manage renew
const withRenew = WrappedComponent => class WithRenewComponent extends React.Component {
  static propTypes = {
    loans: PropTypes.arrayOf(PropTypes.object),
    patronBlocks: PropTypes.arrayOf(PropTypes.object),
    mutator: PropTypes.shape({
      loanPolicies: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func.isRequired,
      }),
      renew: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      requests: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func.isRequired,
      }),
    }),
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }),
    user: PropTypes.object,
  };

  static defaultProps = {
    loans: [],
  };

  constructor(props) {
    super(props);

    this.connectedBulkRenewalDialog = props.stripes.connect(BulkRenewalDialog);
    this.state = {
      additionalInfo: '',
      loans: [],
      // eslint-disable-next-line react/no-unused-state
      errors: [],
      // eslint-disable-next-line react/no-unused-state
      bulkRenewal: false,
      bulkRenewalDialogOpen: false,
      renewSuccess: [],
      renewFailure: [],
      errorMsg: {},
      requestCounts: {},
      loanPolicies: {},
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { loans } = nextProps;

    if (prevState.loans.length < nextProps.loans.length) {
      return { loans };
    }

    return null;
  }

  componentDidMount() {
    this._isMounted = true;
    const { loans } = this.state;

    if (loans.length > 0) {
      this.fetchLoanPolicyNames();
      this.getOpenRequestsCount();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { loans } = this.state;

    if (loans.length > prevState.loans.length) {
      this.fetchLoanPolicyNames();
      this.getOpenRequestsCount();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // fetchLoanPolicyNames and getOpenRequestsCount both execute XHRs that resolve
  // asynchronously and save their results in state. This causes a memory leak if
  // the component is unmounted before the promise resolves as state will not be
  // available at that point. By setting _isMounted in cDM/cWU, we can use it in a
  // condition in those methods to determine whether it is safe to update state.
  _isMounted = false;

  renewItem = (loan, patron, bulkRenewal, silent, additionalInfo) => {
    // eslint-disable-next-line react/no-unused-state
    this.setState({ bulkRenewal });
    const params = {
      itemBarcode: loan.item.barcode,
      userBarcode: patron.barcode,
    };

    if (additionalInfo) {
      params[OVERRIDE_BLOCKS_FIELDS.OVERRIDE_BLOCKS] = {
        [OVERRIDE_BLOCKS_FIELDS.PATRON_BLOCK]: {},
        [OVERRIDE_BLOCKS_FIELDS.COMMENT]: additionalInfo,
      };
    }

    return new Promise((resolve, reject) => {
      this.props.mutator.renew.POST(params, { silent })
        .then(resolve)
        .catch(resp => {
          const contentType = resp.headers.get('Content-Type');

          if (contentType && contentType.startsWith('application/json')) {
            resp.json()
              .then((error) => {
                const errors = this.handleErrors(error);
                reject(this.getMessage(errors));
              });
          } else {
            resp.text()
              .then(reject);
          }
        });
    });
  };

  renew = async (loans, patron, additionalInfo = '') => {
    const renewSuccess = [];
    const renewFailure = [];
    const errorMsg = {};
    const loansSize = loans.length;
    const bulkRenewal = (loansSize > 1);

    for (const [index, loan] of loans.entries()) {
      try {
        // We actually want to execute it in a sequence so turning off eslint warning
        // https://issues.folio.org/browse/UIU-1299
        // eslint-disable-next-line no-await-in-loop
        renewSuccess.push(
          await this.renewItem(loan, patron, bulkRenewal, index !== loansSize - 1, additionalInfo)
        );
      } catch (error) {
        renewFailure.push(loan);
        errorMsg[loan.id] = {
          ...error,
          ...isOverridePossible(this.state.errors),
        };
      }
    }

    if (isEmpty(renewFailure) && renewSuccess.length <= 1) {
      this.showSingleRenewCallout(renewSuccess[0]);

      return renewSuccess;
    }

    this.setState({
      errorMsg,
      renewSuccess,
      renewFailure,
      bulkRenewalDialogOpen: true,
      additionalInfo,
    });

    return renewSuccess;
  };

  showSingleRenewCallout = (loan) => {
    const message = (
      <span>
        <FormattedMessage
          id="ui-users.loans.item.renewed.callout"
          values={{ title: loan.item.title }}
        />
      </span>
    );

    this.callout.sendCallout({ message });
  };

  handleErrors = (error) => {
    const { errors } = error;
    // eslint-disable-next-line react/no-unused-state
    this.setState({ errors });
    return errors;
  };

  getPolicyName = (errors) => {
    for (const err of errors) {
      for (const param of err.parameters) {
        if (param.key === 'loanPolicyName') {
          return param.value;
        }
      }
    }

    return '';
  };

  // eslint-disable-next-line class-methods-use-this
  getMessage = (errors) => {
    if (!errors || !errors.length) return '';

    const policyName = this.getPolicyName(errors);
    const message = errors.reduce((msg, err) => ((msg) ? `${msg}, ${err.message}` : err.message), '');

    return policyName ? (
      <FormattedMessage
        id="ui-users.errors.reviewBeforeRenewal"
        values={{ message, policyName }}
      />
    ) : (
      <FormattedMessage
        id="ui-users.errors.loanNotRenewedReason"
        values={{ message }}
      />
    );
  };

  hideBulkRenewalDialog = () => this.setState({ bulkRenewalDialogOpen: false });

  /**
   * retrieve count of open requests against this patron's open loans and
   * store a map of itemId => open-request count in state.
   *
   * It sure would be nice if there were a more efficient way to construct
   * this query than joining the entire list of item-ids, but there ain't.
   * See CHAL-30 for details of the pain this causes.
   */
  getOpenRequestsCount = () => {
    const {
      mutator: {
        requests: {
          reset,
          GET,
        },
      },
    } = this.props;

    const { loans } = this.state;

    // step through the loans list in small batches in order to create a
    // short-enough query string that we can avoid a "414 Request URI Too Long"
    // response from Okapi. Details at CHAL-30
    const step = 50;

    const statusList = Object.values(requestStatuses)
      .filter(s => s.startsWith('Open - '))
      .map(s => `"${s}"`)
      .join(' OR ');

    for (let i = 0; i < loans.length; i += step) {
      const loansSlice = loans.slice(i, i + step);
      const itemIdList = loansSlice
        .filter(loan => loan.itemId)
        .map(loan => loan.itemId);
      const query = `(itemId==(${itemIdList.join(' or ')})) and status==(${statusList}) sortby requestDate desc`;
      reset();
      GET({ params: { query, limit: MAX_RECORDS } })
        .then((requestRecords) => {
          const requestCountObject = requestRecords.reduce((map, record) => {
            map[record.itemId] = map[record.itemId]
              ? map[record.itemId] + 1
              : 1;

            return map;
          }, {});

          if (this._isMounted) {
            this.setState(prevState => ({
              requestCounts: { ...prevState.requestCounts, ...requestCountObject }
            }));
          }
        });
    }
  };

  /**
   * retrieve loan policies related to current loans and store a map of
   * loan-policy.id => loan-policy.name in state.
   */
  fetchLoanPolicyNames = () => {
    const {
      mutator: {
        loanPolicies: {
          reset,
          GET,
        },
      },
    } = this.props;

    // get a list of unique policy IDs to retrieve. multiple loans may share
    // the same policy; we only need to retrieve that policy once.
    const ids = [...new Set(this.state.loans
      .filter(loan => loan.loanPolicyId)
      .map(loan => loan.loanPolicyId))];
    const query = `id==(${ids.join(' or ')})`;

    if (ids.length) {
      reset();
      GET({ params: { query, limit: `${ids.length}` } })
        .then((loanPolicies) => {
          const loanPolicyObject = loanPolicies.reduce((map, loanPolicy) => {
            map[loanPolicy.id] = loanPolicy.name;

            return map;
          }, {});

          if (this._isMounted) {
            this.setState({ loanPolicies: loanPolicyObject });
          }
        });
    }
  };

  render() {
    const {
      bulkRenewalDialogOpen,
      additionalInfo,
      renewSuccess,
      renewFailure,
      errorMsg,
      loanPolicies,
      requestCounts,
    } = this.state;
    const {
      user,
      stripes,
    } = this.props;

    return (
      <>
        <WrappedComponent
          renew={this.renew}
          requestCounts={requestCounts}
          loanPolicies={loanPolicies}
          calloutRef={(ref) => { this.callout = ref; }}
          {...this.props}
        />
        <this.connectedBulkRenewalDialog
          additionalInfo={additionalInfo}
          user={user}
          stripes={stripes}
          errorMessages={errorMsg}
          loanPolicies={loanPolicies}
          open={bulkRenewalDialogOpen}
          failedRenewals={renewFailure}
          requestCounts={requestCounts}
          successRenewals={renewSuccess}
          onClose={this.hideBulkRenewalDialog}
        />
        <Callout ref={(ref) => { this.callout = ref; }} />
      </>
    );
  }
};

export default withRenew;
