import React from 'react';
import PropTypes from 'prop-types';
import KeyValue from '@folio/stripes-components/lib/KeyValue';

class LoanActionsHistoryProxy extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    resources: PropTypes.shape({
      proxy: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
  }

  static manifest = Object.freeze({
    proxy: {
      type: 'okapi',
      path: 'users/!{id}',
    },
  });

  getUserFullName() {
    const proxy = (this.props.resources.proxy || {}).records || [];
    if (proxy.length === 1 && proxy[0].id === this.props.id) {
      return `${proxy[0].personal.firstName} ${proxy[0].personal.lastName}`;
    }

    return this.props.id;
  }

  render() {
    if (this.props.id) {
      return <KeyValue label="Proxy Borrower" value={this.getUserFullName()} />;
    }

    return <KeyValue label="Proxy Borrower" value="-" />;
  }
}

export default LoanActionsHistoryProxy;
