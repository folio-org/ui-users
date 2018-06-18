import React from 'react';
import PropTypes from 'prop-types';

import ErrorModal from './lib/ErrorModal';

// HOC used to manage renew
const withRenew = WrappedComponent =>
  class WithRenewComponent extends React.Component {
    static propTypes = {
      mutator: PropTypes.shape({
        renew: PropTypes.shape({
          POST: PropTypes.func.isRequired,
        }),
      }),
      stripes: PropTypes.shape({
        intl: PropTypes.shape({
          formatMessage: PropTypes.func.isRequired,
        }).isRequired,
      }).isRequired,
    };

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
      const errors = (error.errors || []).map(err => err.message);
      this.setState({ errors });
      return errors;
    }

    hideModal() {
      this.setState({ errors: [] });
    }

    getMessage(errors) {
      this.errors = errors;
      if (!this.errors.length) return '';
      return this.errors.reduce((msg, error) => ((msg) ? `${msg}, ${error}` : error), '');
    }

    render() {
      const { errors } = this.state;
      const msg = this.getMessage(errors);
      const popupMessage = `Loan cannot be renewed because: ${msg}.`;

      return (
        <div>
          <WrappedComponent renew={this.renew} {...this.props} />
          {errors &&
            <ErrorModal
              id="renewal-failure-modal"
              open={errors.length > 0 && !this.state.bulkRenewal}
              onClose={this.hideModal}
              message={popupMessage}
              label={this.props.stripes.intl.formatMessage({ id: 'ui-users.loanNotRenewed' })}
            />
          }
        </div>
      );
    }
  };


export default withRenew;
