import _ from 'lodash';
import React from 'react';
import List from '@folio/stripes-components/lib/List';
import TextField from '@folio/stripes-components/lib/TextField';
import Icon from '@folio/stripes-components/lib/Icon';
import css from './PermissionList.css';

function PermissionList(props) {
  const { stripes, onChangeSearch, onClickItem } = props;
  const handleSearchChange = e => onChangeSearch(e);
  const handleItemClick = item => onClickItem(item);

  const showPerms = _.get(stripes, ['config', 'showPerms']);
  const permissionDDFormatter = item => (
    <li key={item.permissionName}>
      <button type="button" className={css.itemControl} onClick={() => { handleItemClick(item); }}>
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
        placeholder="Search"
        startControl={<Icon icon="search" />}
        onChange={handleSearchChange}
      />
      <List
        itemFormatter={permissionDDFormatter}
        items={props.items.sort((a, b) => {
          const key = showPerms ? 'permissionName' : 'displayName';
          return (a[key] < b[key] ? -1 : 1);
        })}
        listClass={css.PermissionList}
      />
    </div>
  );
}

PermissionList.propTypes = {
  onChangeSearch: React.PropTypes.func.isRequired,
  onClickItem: React.PropTypes.func.isRequired,
  items: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  stripes: React.PropTypes.shape({
    config: React.PropTypes.shape({
      showPerms: React.PropTypes.bool,
    }),
  }).isRequired,
};

export default PermissionList;
