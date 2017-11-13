import React from 'react';
import PropTypes from 'prop-types';

import css from './ProxyViewList.css';

const ProxyViewList = ({ records, name, label, itemComponent }) => {
  const ComponentToRender = itemComponent;

  const items = records.map((record, index) => (
    <ComponentToRender key={`item-${index}`} record={record} />
  ));

  return (
    <div className={css.list}>
      <h3 className={css.label}>{label}</h3>
      {items.length ? items : <i >- No {name} found -</i>}
    </div>
  );
};

ProxyViewList.propTypes = {
  records: PropTypes.arrayOf(PropTypes.object),
  itemComponent: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

export default ProxyViewList;
