import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  isEmpty,
  get,
} from 'lodash';

import SafeHTMLMessage from '@folio/react-intl-safe-html';
import BulkRenewalDialog from './components/BulkRenewalDialog';
import isOverridePossible from './components/Loans/OpenLoans/helpers/isOverridePossible/isOverridePossible';

// HOC used to manage renew
const withRenew = WrappedComponent => class WithRenewComponent extends React.Component {
  static manifest = Object.freeze(
    Object.assign({}, WrappedComponent.manifest, {
      renew: {
        fetch: false,
        type: 'okapi',
        path: 'circulation/renew-by-barcode',
        POST: {
          path: 'circulation/renew-by-barcode',
        },
        throwErrors: false,
      }
    }),
  );

  static propTypes = {
    mutator: PropTypes.shape({
      renew: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
    }),
    loans: PropTypes.object,
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
              .then(error => {
                reject(error);
              });
          }
        });
    });
  };

  renew = (loans, patron) => {
    const { patronBlocks } = this.props;
    const renewSuccess = [];
    const renewFailure = [];
    const errorMsg = {};
    const countRenew = patronBlocks.filter(p => p.renewals);
    const bulkRenewal = (loans.length > 1);

    if (!isEmpty(countRenew)) {
      return this.setState({ patronBlockedModal: true });
    }

    const renewedLoans = loans.map((loan) => {
      return this.renewItem(loan, patron, bulkRenewal)
        .then((renewedLoan) => renewSuccess.push(renewedLoan))
        .catch((error) => {
          renewFailure.push(loan);
          const stringErrorMessage = get(error, 'props.values.message.props.values.message', '');

          errorMsg[loan.id] = {
            ...error,
            ...isOverridePossible(stringErrorMessage),
          };
        });
    });

    this.setState({ errorMsg });

    // map(p => p.catch(e => e)) turns all rejections into resolved values for the promise.all to wait for everything to finish
    return Promise.all(renewedLoans.map(p => p.catch(e => e)))
      .then(() => {
        if (!isEmpty(renewFailure)) {
          this.setState({
            renewSuccess,
            renewFailure,
            bulkRenewalDialogOpen: true
          });
        } else {
          this.showSingleRenewCallout(renewSuccess[0]);
        }
      });
  };

  showSingleRenewCallout(loan) {
    const message = (
      <span>
        <SafeHTMLMessage
          id="ui-users.loans.item.renewed.callout"
          values={{ title: loan.item.title }}
        />
      </span>
    );

    this.callout.sendCallout({ message });
  }

  handleErrors(error) {
    const { errors } = error;
    this.setState({ errors });
    return errors;
  }

  getPolicyName(errors) {
    for (const err of errors) {
      for (const param of err.parameters) {
        if (param.key === 'loanPolicyName') {
          return param.value;
        }
      }
    }

    return '';
  }

  // eslint-disable-next-line class-methods-use-this
  getMessage = (errors) => {
    if (!errors || !errors.length) return '';

    const policyName = this.getPolicyName(errors);
    let message = errors.reduce((msg, err) => ((msg) ? `${msg}, ${err.message}` : err.message), '');
    message = (
      <FormattedMessage
        id="ui-users.errors.loanNotRenewedReason"
        values={{ message }}
      />
    );

    if (policyName) {
      message = (
        <FormattedMessage
          id="ui-users.errors.reviewBeforeRenewal"
          values={{ message, policyName }}
        />
      );
    }

    return message;
  };

  hideBulkRenewalDialog = () => {
    this.setState({
      bulkRenewalDialogOpen: false,
    });
  };

  getOpenRequestsCount() {
    const {
      stripes,
      mutator: {
        loanPolicies: {
          reset,
          GET,
        },
      },
    } = this.props;

    const { loans } = this.state;

    if (!stripes.hasPerm(this.permissions.allRequests)) {
      return;
    }

    const q = loans.map(loan => `itemId==${loan.itemId}`).join(' or ');
    const query = `(${q}) and status==("Open - Awaiting pickup" or "Open - Not yet filled") sortby requestDate desc`;

    reset();

    GET({ params: { query } })
      .then((requestRecords) => {
        const requestCountObject = requestRecords.reduce((map, record) => {
          map[record.itemId] = map[record.itemId]
            ? ++map[record.itemId]
            : 1;

          return map;
        }, {});
        this.setState({ requestCounts: requestCountObject });
      });
  }


  fetchLoanPolicyNames() {
    const query = this.state.loans.map(loan => `id==${loan.loanPolicyId}`).join(' or ');
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
  }

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
      </Fragment>
    );
  }
};

export default withRenew;
