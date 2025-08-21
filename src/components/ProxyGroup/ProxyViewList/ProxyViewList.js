import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';

import { Headline } from '@folio/stripes/components';
import css from './ProxyViewList.css';

const ProxyViewList = ({ records, name, label, itemComponent, stripes }) => {
  const ComponentToRender = itemComponent;

  // sort records by user display name
  const sortedRecords = _.sortBy(records, record => `${record?.user?.personal?.lastName} ${record?.user?.personal?.firstName}`);

  const items = sortedRecords.map((record, index) => (
    <ComponentToRender key={`item-${index}`} record={record} stripes={stripes} />
  ));
  const noSponsorsFound = <FormattedMessage id="ui-users.permissions.noSponsorsFound" />;
  const noProxiesFound = <FormattedMessage id="ui-users.permissions.noProxiesFound" />;
  const noneFoundMsg = name === 'sponsors' ? noSponsorsFound : noProxiesFound;

  return (
    <div className={css.list} data-test={name}>
      <Headline tag="h4" size="small" margin="small">{label}</Headline>
      {items.length ? items : <p className={css.isEmptyMessage}>{noneFoundMsg}</p>}
    </div>
  );
};

ProxyViewList.propTypes = {
  records: PropTypes.arrayOf(PropTypes.shape({})),
  itemComponent: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  stripes: PropTypes.shape({}).isRequired,
};

export default ProxyViewList;
