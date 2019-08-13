import _ from 'lodash';
import React from 'react';
import {
  injectIntl,
  intlShape,
} from 'react-intl';
import PropTypes from 'prop-types';
import {
  Icon,
  TextField,
  List,
} from '@folio/stripes/components';
import css from './PermissionList.css';

function PermissionList(props) {
  const {
    stripes,
    onChangeSearch,
    onClickItem,
    intl,
  } = props;
  const handleSearchChange = e => onChangeSearch(e);
  const handleItemClick = item => onClickItem(item);

  const showPerms = _.get(stripes, ['config', 'showPerms']);
  const permissionDDFormatter = item => (
    <li key={item.permissionName}>
      <button type="button" className={css.itemControl} onClick={() => { handleItemClick(item); }} data-permission-name={`${item.permissionName}`}>
        {(!item.displayName ?
          item.permissionName :
          (!showPerms ? item.displayName :
            `${item.permissionName} (${item.displayName})`))}
      </button>
    </li>
  );

  return (
    <div className={css.root}>
      <TextField
        noBorder
        placeholder={intl.formatMessage({ id: 'ui-users.search' })}
        startControl={<Icon icon="search" />}
        onChange={handleSearchChange}
      />
      <List
        itemFormatter={permissionDDFormatter}
        items={props.items.sort((a, b) => {
          const key = showPerms ? 'permissionName' : 'displayName';
          return (a[key].toLowerCase() < b[key].toLowerCase() ? -1 : 1);
        })}
        listClass={css.PermissionList}
      />
    </div>
  );
}

PermissionList.propTypes = {
  onChangeSearch: PropTypes.func.isRequired,
  onClickItem: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  stripes: PropTypes.shape({
    config: PropTypes.shape({
      showPerms: PropTypes.bool,
    }),
  }).isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(PermissionList);
