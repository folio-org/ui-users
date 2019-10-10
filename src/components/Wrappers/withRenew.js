import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  isEmpty,
  get,
} from 'lodash';

import { Callout } from '@folio/stripes/components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import BulkRenewalDialog from '../BulkRenewalDialog';
import isOverridePossible from '../Loans/OpenLoans/helpers/isOverridePossible';

// HOC used to manage renew
const withRenew = WrappedComponent => class WithRenewComponent extends React.Component {
  static propTypes = {
    loans: PropTypes.object,
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
  };

  static defaultProps = {
    loans: [],
  };

  constructor(props) {
    super(props);

    this.permissions = { allRequests: 'ui-users.requests.all' };
    this.connectedBulkRenewalDialog = props.stripes.connect(BulkRenewalDialog);
    this.state = {
      loans: [],
      errors: [],
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

  renewItem = (loan, patron, bulkRenewal) => {
    this.setState({ bulkRenewal });
    const params = {
      itemBarcode: loan.item.barcode,
      userBarcode: patron.barcode,
    };

    return new Promise((resolve, reject) => {
      this.props.mutator.renew.POST(params)
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

  renew = async (loans, patron) => {
    const { patronBlocks } = this.props;
    const renewSuccess = [];
    const renewFailure = [];
    const errorMsg = {};
    const countRenew = patronBlocks.filter(p => p.renewals);
    const bulkRenewal = (loans.length > 1);

    if (!isEmpty(countRenew)) {
      return this.setState({ patronBlockedModal: true });
    }

    const renewedLoans = await Promise.all(loans.map(async (loan) => {
      try {
        const renewedLoan = await this.renewItem(loan, patron, bulkRenewal);

        renewSuccess.push(renewedLoan);
      } catch (error) {
        const stringErrorMessage = get(error, 'props.values.message', '');

        renewFailure.push(loan);
        errorMsg[loan.id] = {
          ...error,
          ...isOverridePossible(stringErrorMessage),
        };
      }
    }));

    if (isEmpty(renewFailure) && renewSuccess.length <= 1) {
      this.showSingleRenewCallout(renewSuccess[0]);

      return renewedLoans;
    }

    this.setState({
      errorMsg,
      renewSuccess,
      renewFailure,
      bulkRenewalDialogOpen: true
    });

    return renewedLoans;
  };

  showSingleRenewCallout = (loan) => {
    const message = (
      <span>
        <SafeHTMLMessage
          id="ui-users.loans.item.renewed.callout"
          values={{ title: loan.item.title }}
        />
      </span>
    );

    this.callout.sendCallout({ message });
  };

  handleErrors = (error) => {
    const { errors } = error;
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
      stripes,
      mutator: {
        requests: {
          reset,
          GET,
        },
      },
    } = this.props;

    const { loans } = this.state;

    if (!stripes.hasPerm(this.permissions.allRequests)) {
      return;
    }

    // step through the loans list in small batches in order to create a
    // short-enough query string that we can avoid a "414 Request URI Too Long"
    // response from Okapi. Details at CHAL-30
    const step = 50;
    for (let i = 0; i < loans.length; i += step) {
      const loansSlice = loans.slice(i, i + step);
      const q = loansSlice.map(loan => loan.itemId).join(' or ');
      const query = `(itemId==(${q})) and status==("Open - Awaiting pickup" or "Open - Not yet filled") sortby requestDate desc`;
      reset();
      GET({ params: { query } })
        .then((requestRecords) => {
          const requestCountObject = requestRecords.reduce((map, record) => {
            map[record.itemId] = map[record.itemId]
              ? map[record.itemId] + 1
              : 1;

            return map;
          }, {});

          this.setState(prevState => ({
            requestCounts: Object.assign({}, prevState.requestCounts, requestCountObject)
          }));
        });
    }
  };

  /**
   * retrieve loan policies related to current loans and store a map of
   * loan-policy.id => loan-policy.name in state.
   */
  fetchLoanPolicyNames = () => {
    // get a list of unique policy IDs to retrieve. multiple loans may share
    // the same policy; we only need to retrieve that policy once.
    const query = `id==(${[...new Set(this.state.loans.map(loan => loan.loanPolicyId))].join(' or ')})`;
    const {
      mutator: {
        loanPolicies: {
          reset,
          GET,
        },
      },
    } = this.props;

    reset();
    GET({ params: { query } })
      .then((loanPolicies) => {
        const loanPolicyObject = loanPolicies.reduce((map, loanPolicy) => {
          map[loanPolicy.id] = loanPolicy.name;

          return map;
        }, {});

        this.setState({ loanPolicies: loanPolicyObject });
      });
  };

  render() {
    const {
      bulkRenewalDialogOpen,
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
      <Fragment>
        <WrappedComponent
          renew={this.renew}
          requestCounts={requestCounts}
          loanPolicies={loanPolicies}
          calloutRef={(ref) => { this.callout = ref; }}
          {...this.props}
        />
        <this.connectedBulkRenewalDialog
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
      </Fragment>
    );
  }
};

export default withRenew;