import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { KeyValue } from '@folio/stripes/components';
import { stripesConnect } from '@folio/stripes/core';
import { getFullName } from '../../components/util';



class LoanProxyDetails extends React.Component {
  static manifest = Object.freeze({
    proxy: {
      type: 'okapi',
      path: 'users/!{id}',
    },
  });

  static propTypes = {
    id: PropTypes.string,
    resources: PropTypes.shape({
      proxy: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
  }

  getUserFullName() {
    const proxy = (this.props.resources.proxy || {}).records || [];
    if (proxy.length === 1 && proxy[0].id === this.props.id) {
      return <Link to={`/users/view/${this.props.id}`}>{getFullName(proxy[0])}</Link>;
    }

    return this.props.id;
  }

  render() {
    if (this.props.id) {
      return <KeyValue
        label={<FormattedMessage id="ui-users.loans.details.proxyBorrower" />}
        value={this.getUserFullName()}
      />;
    }

    return <KeyValue
      label={<FormattedMessage id="ui-users.loans.details.proxyBorrower" />}
      value="-"
    />;
  }
}

export default stripesConnect(LoanProxyDetails);
