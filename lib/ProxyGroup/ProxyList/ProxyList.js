import React from 'react';
import PropTypes from 'prop-types';

import ProxyItem from '../ProxyItem';
import css from './ProxyList.css';

const ProxyList = ({ proxies }) => {
  const items = proxies.map((proxy, index) => (
    <ProxyItem key={`proxy-${index}`} proxy={proxy} />
  ));

  return (
    <div>
      <h3 className={css.label}>Proxy</h3>
      {items}
      {!items.length && <p>No proxies found</p>}
    </div>
  );
};

ProxyList.propTypes = {
  proxies: PropTypes.arrayOf(PropTypes.object),
};

export default ProxyList;
