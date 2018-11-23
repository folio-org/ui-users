import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import ErrorModal from './components/ErrorModal';

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
    };

    constructor(props) {
      super(props);
      this.renew = this.renew.bind(this);
      this.hideModal = this.hideModal.bind(this);
      this.getMessage = this.getMessage.bind(this);
      this.state = {
        errors: [],
        bulkRenewal: false
      };
    }

    renew(loan, patron, bulkRenewal) {
      this.setState({ bulkRenewal });
      const params = {
        itemBarcode: loan.item.barcode,
        userBarcode: patron.barcode,
      };

      return new Promise((resolve, reject) => {
        this.props.mutator.renew.POST(params).then(resolve).catch(resp => {
          const contentType = resp.headers.get('Content-Type');
          if (contentType && contentType.startsWith('application/json')) {
            resp.json().then((error) => {
              const errors = this.handleErrors(error);
              reject(this.getMessage(errors));
            });
          } else {
            resp.text().then((error) => {
              reject(error);
              alert(error); // eslint-disable-line no-alert
            });
          }
        });
      });
    }

    handleErrors(error) {
      const { errors } = error;
      this.setState({ errors });
      return errors;
    }

    hideModal() {
      this.setState({ errors: [] });
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
    getMessage(errors) {
      if (!errors || !errors.length) return '';

      const policyName = this.getPolicyName(errors);
      let message = errors.reduce((msg, err) => ((msg) ? `${msg}, ${err.message}` : err.message), '');
      message = `Loan cannot be renewed because: ${message}.`;

      if (policyName) {
        message = `${message} Please review ${policyName} before retrying renewal.`;
      }

      return message;
    }

    render() {
      const { errors } = this.state;
      const message = this.getMessage(errors);

      return (
        <div>
          <WrappedComponent renew={this.renew} {...this.props} />
          {errors &&
            <ErrorModal
              id="renewal-failure-modal"
              open={errors.length > 0 && !this.state.bulkRenewal}
              onClose={this.hideModal}
              message={message}
              label={<FormattedMessage id="ui-users.loanNotRenewed" />}
            />
          }
        </div>
      );
    }
};


export default withRenew;
