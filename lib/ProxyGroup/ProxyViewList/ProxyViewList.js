import React from 'react';
import PropTypes from 'prop-types';
import Headline from '@folio/stripes-components/lib/Headline';
import css from './ProxyViewList.css';

const ProxyViewList = ({ records, name, label, itemComponent }) => {
  const ComponentToRender = itemComponent;
  const items = records.map((record, index) => (
    <ComponentToRender key={`item-${index}`} record={record} />
  ));

  return (
    <div className={css.list}>
      <Headline tag="h4" size="medium">{label}</Headline>
      {items.length ? items : <p className={css.isEmptyMessage}>No {name} found</p>}
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
