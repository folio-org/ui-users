import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import {
  KeyValue,
  NoValue,
} from '@folio/stripes/components';
import { stripesConnect } from '@folio/stripes/core';
import { getFullName } from '../../components/util';

class LoanProxyDetails extends React.Component {
  static manifest = Object.freeze({
    proxy: {
      type: 'okapi',
      path: 'users/!{id}',
      fetch: false,
      accumulate: 'true',
      throwErrors: false,
    },
  });

  static propTypes = {
    id: PropTypes.string,
    resources: PropTypes.shape({
      proxy: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
        hasLoaded: PropTypes.bool,
      }),
    }),
    mutator: PropTypes.shape({
      proxy: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    showErrorCallout: PropTypes.func.isRequired,
  }

  componentDidMount() {
    if (this.props.id) {
      this.props.mutator.proxy.reset();
      this.props.mutator.proxy.GET()
        .catch(() => {
          this.props.showErrorCallout('ui-users.errors.proxyBorrowerNotFound');
        });
    }
  }

  getUserFullName() {
    const proxy = (this.props.resources.proxy || {}).records || [];
    if (proxy.length === 1 && proxy[0].id === this.props.id) {
      return <Link to={`/users/view/${this.props.id}`}>{getFullName(proxy[0])}</Link>;
    }

    return <FormattedMessage id="ui-users.user.unknown" />;
  }

  render() {
    let value = <NoValue />;

    if (this.props.id && this.props.resources.proxy.hasLoaded) {
      value = this.getUserFullName();
    } else if (this.props.id) {
      value = <FormattedMessage id="ui-users.user.unknown" />;
    }

    return <KeyValue
      label={<FormattedMessage id="ui-users.loans.details.proxyBorrower" />}
      value={value}
    />;
  }
}

export default stripesConnect(LoanProxyDetails);
