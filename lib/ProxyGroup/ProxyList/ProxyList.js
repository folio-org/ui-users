import React from 'react';
import PropTypes from 'prop-types';
import ProxyItem from '../ProxyItem';

export default class ProxyList extends React.Component {
  static propTypes = {
    proxies: PropTypes.arrayOf(PropTypes.object),
  };

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
