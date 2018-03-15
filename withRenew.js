import { omit, get } from 'lodash';
import moment from 'moment'; // eslint-disable-line import/no-extraneous-dependencies
import React from 'react';
import PropTypes from 'prop-types';

import ErrorModal from './lib/ErrorModal';
import { getFixedDueDateSchedule, calculateDueDate, isLoanProfileFixed } from './loanUtils';

// HOC used to manage renew
const withRenew = WrappedComponent =>
  class WithRenewComponent extends React.Component {
    static propTypes = {
      mutator: PropTypes.shape({
        loanId: PropTypes.shape({
          replace: PropTypes.func,
        }),
        items: PropTypes.shape({
          GET: PropTypes.func,
          reset: PropTypes.func,
        }),
        loanPolicies: PropTypes.shape({
          GET: PropTypes.func,
          reset: PropTypes.func,
        }),
        fixedDueDateSchedules: PropTypes.shape({
          GET: PropTypes.func,
          reset: PropTypes.func,
        }),
        loans: PropTypes.shape({
          GET: PropTypes.func,
          POST: PropTypes.func,
        }),
        loansHistory: PropTypes.shape({
          PUT: PropTypes.func.isRequired,
        }),
      }),
    };

    static manifest = Object.freeze(
      Object.assign({}, WrappedComponent.manifest, {
        loanId: {},
        loanPolicies: {
          type: 'okapi',
          records: 'loanPolicies',
          path: 'loan-policy-storage/loan-policies',
          accumulate: 'true',
          fetch: false,
        },
        fixedDueDateSchedules: {
          type: 'okapi',
          records: 'fixedDueDateSchedules',
          path: 'fixed-due-date-schedule-storage/fixed-due-date-schedules',
          accumulate: 'true',
          fetch: false,
        },
        loansHistory: {
          fetch: false,
          type: 'okapi',
          PUT: {
            path: 'circulation/loans/%{loanId}',
          },
        },
      }),
    );

    constructor(props) {
      super(props);
      this.renew = this.renew.bind(this);
      this.hideModal = this.hideModal.bind(this);
      this.state = { error: null };
    }

    renew(data) {
      return this.fetchLoanPolicy(data)
        .then(loan => this.fetchFixedDueDateSchedule(loan))
        .then(loan => this.fetchAlternateFixedDueDateSchedule(loan))
        .then(loan => this.validateRenew(loan))
        .then(loan => this.execRenew(loan))
        .catch((error) => {
          this.setState({ error });
          throw error;
        });
    }

    fetchLoanPolicy(loan) {
      const query = `(id=="${loan.loanPolicyId}")`;
      this.props.mutator.loanPolicies.reset();
      return this.props.mutator.loanPolicies.GET({ params: { query } }).then((policies) => {
        const loanPolicy = policies.find(p => p.id === loan.loanPolicyId);
        loan.loanPolicy = loanPolicy;
        return loan;
      });
    }

    fetchFixedDueDateSchedule(loan) {
      const scheduleId = get(loan, 'loanPolicy.loansPolicy.fixedDueDateSchedule', '');
      if (!scheduleId) return loan;

      return this.fetchSchedule(loan, scheduleId).then((schedule) => {
        loan.loanPolicy.fixedDueDateSchedule = schedule;
        return loan;
      });
    }

    fetchAlternateFixedDueDateSchedule(loan) {
      const scheduleId = get(loan, 'loanPolicy.renewalsPolicy.alternateFixedDueDateScheduleId', '');
      if (!scheduleId) return loan;

      return this.fetchSchedule(loan, scheduleId).then((schedule) => {
        loan.loanPolicy.alternateFixedDueDateSchedule = schedule;
        return loan;
      });
    }

    fetchSchedule(loan, scheduleId) {
      const query = `(id=="${scheduleId}")`;
      this.props.mutator.fixedDueDateSchedules.reset();
      return this.props.mutator.fixedDueDateSchedules.GET({ params: { query } })
        .then(fixedDueDateSchedules => fixedDueDateSchedules[0]);
    }

    validateRenew(loan) {
      const { loanPolicy } = loan;
      const loansPolicy = loanPolicy.loansPolicy || {};

      if (isLoanProfileFixed(loansPolicy)) {
        this.validateSchedules(loanPolicy);
      }

      this.validateDueDate(loan);

      return loan;
    }

    validateSchedules(loanPolicy) {
      const { fixedDueDateSchedule, alternateFixedDueDateSchedule } = loanPolicy;
      const schedule = this.validateSchedule(loanPolicy, alternateFixedDueDateSchedule);

      if (!schedule) {
        this.validateSchedule(loanPolicy, fixedDueDateSchedule);
      }
    }

    validateSchedule(loanPolicy, dueDateSchedule) {
      if (!dueDateSchedule) return dueDateSchedule;

      const schedule = getFixedDueDateSchedule(dueDateSchedule.schedules);

      if (!schedule) {
        return this.throwError(` Item can't be renewed as the renewal date falls outside
          of the date ranges in the loan policy.
          Please review ${loanPolicy.name} before retrying renewal.`);
      }

      dueDateSchedule.schedule = schedule;
      return dueDateSchedule;
    }

    validateDueDate(loan) {
      const newDueDate = calculateDueDate(loan).startOf('day');
      const currentDueDate = moment(loan.dueDate).startOf('day');

      if (newDueDate.isSameOrBefore(currentDueDate)) {
        return this.throwError('Renewal at this time would not change the due date.');
      }

      return loan;
    }

    // eslint-disable-next-line class-methods-use-this
    throwError(message) {
      const error = { message };
      throw error;
    }

    execRenew(loan) {
      Object.assign(loan, {
        renewalCount: (loan.renewalCount || 0) + 1,
        loanDate: moment(loan.loanDate).format(),
        dueDate: calculateDueDate(loan).format(),
        action: 'renewed',
      });

      const loanData = omit(loan, ['item', 'rowIndex', 'loanPolicy']);

      this.props.mutator.loanId.replace(loan.id);
      return this.props.mutator.loansHistory.PUT(loanData);
    }

    hideModal() {
      this.setState({ error: null });
    }

    render() {
      const { error } = this.state;

      return (
        <div>
          <WrappedComponent renew={this.renew} {...this.props} />
          {error &&
            <ErrorModal
              open={!!(error)}
              onClose={this.hideModal}
              message={error.message}
              label="Item not renewed"
            />
          }
        </div>
      );
    }
  };


export default withRenew;
