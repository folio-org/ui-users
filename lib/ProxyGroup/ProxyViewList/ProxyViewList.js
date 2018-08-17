import React from 'react';
import PropTypes from 'prop-types';
import Headline from '@folio/stripes-components/lib/Headline';
import css from './ProxyViewList.css';

const ProxyViewList = ({ records, name, label, itemComponent, stripes }) => {
  const ComponentToRender = itemComponent;
  const items = records.map((record, index) => (
    <ComponentToRender key={`item-${index}`} record={record} stripes={stripes} />
  ));
  const noSponsorsFound = stripes.intl.formatMessage({ id: 'ui-users.permissions.noSponsorsFound' });
  const noProxiesFound = stripes.intl.formatMessage({ id: 'ui-users.permissions.noProxiesFound' });
  const noneFoundMsg = name === 'sponsors' ? noSponsorsFound : noProxiesFound;

  return (
    <div className={css.list}>
      <Headline tag="h4" size="small" margin="small">{label}</Headline>
      {items.length ? items : <p className={css.isEmptyMessage}>{noneFoundMsg}</p>}
    </div>
  );
};

ProxyViewList.propTypes = {
  records: PropTypes.arrayOf(PropTypes.object),
  itemComponent: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  stripes: PropTypes.object.isRequired,
};

export default ProxyViewList;
