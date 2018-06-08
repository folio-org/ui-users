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
      const params = {
        itemBarcode: loan.item.barcode,
        userBarcode: patron.barcode,
      };

      this.setState({ bulkRenewal });

      return this.props.mutator.renew.POST(params).catch(resp => {
        const contentType = resp.headers.get('Content-Type');
        if (contentType && contentType.startsWith('application/json')) {
          resp.json().then(error => this.handleErrors(error));
        } else {
          // eslint-disable-next-line no-alert
          resp.text().then(error => alert(error));
        }
        throw new Error(resp);
      });
    }

    handleErrors(error) {
      const errors = (error.errors || []).map(err => err.message);
      this.setState({ errors });
    }


    hideModal() {
      this.setState({ errors: [] });
    }

    getMessage() {
      const { errors } = this.state;
      if (!errors.length) return '';
      return errors.reduce((msg, error) => ((msg) ? `${msg}, ${error}` : error), '');
    }

    render() {
      const { errors } = this.state;
      const msg = this.getMessage();
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
