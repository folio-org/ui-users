import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Pluggable from '@folio/stripes-components/lib/Pluggable';

import { getFullName, getRowURL, getAnchoredRowFormatter } from '../../../util';
import ProxyItem from '../ProxyItem';

export default class ProxyList extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    history: PropTypes.object,
    proxies: PropTypes.arrayOf(PropTypes.object),
    onAdd: PropTypes.func,
    parentMutator: PropTypes.shape({
      proxiesFor: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.addProxy = this.addProxy.bind(this);
    this.onSelectRow = this.onSelectRow.bind(this);
  }

  onSelectRow(event, user) {
    this.props.history.push(getRowURL(user));
  }

  addProxy(selectedUser) {
    const { user, parentMutator } = this.props;
    const data = {
      userId: user.id,
      proxyUserId: selectedUser.id,
      meta: {},
    };

    parentMutator.proxiesFor.POST(data).then(() => this.props.onAdd());
  }

  render() {
    const proxies = this.props.proxies;
    const items = proxies.map((proxy, index) => (
      <ProxyItem key={`proxy-${index}`} proxy={proxy} />
    ));

    return (
      <div>
        <h2>Proxy</h2>
        {items}
      </div>
    );
  }
}