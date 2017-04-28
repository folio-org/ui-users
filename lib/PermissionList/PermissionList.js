import _ from 'lodash';
// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React from 'react';
import uuid from 'uuid'; // eslint-disable-line
import List from '@folio/stripes-components/lib/List';
import TextField from '@folio/stripes-components/lib/TextField';
import Icon from '@folio/stripes-components/lib/Icon';
import css from './PermissionList.css';

function PermissionList(props) {
  const { stripes, onChangeSearch, onClickItem } = props;
  const handleSearchChange = e => onChangeSearch(e);
  const handleItemClick = item => onClickItem(item);

  // XXX key should be item.permissionName, and we should not import 'uuid': see STRIPES-335
  const permissionDDFormatter = item => (
    <li key={uuid()}>
      <button type="button" className={css.itemControl} onClick={() => { handleItemClick(item); }}>
        {(!item.displayName ?
          item.permissionName :
          (!_.get(stripes, ['config', 'showPerms']) ?
           item.displayName :
           `${item.permissionName} (${item.displayName})`))}
      </button>
    </li>
  );

  return (
    <div>
      <TextField
        noBorder
        placeholder="Search"
        startControl={<Icon icon="search" />}
        onChange={handleSearchChange}
      />
      <List
        itemFormatter={permissionDDFormatter}
        items={props.items.sort((a, b) => (a.permissionName < b.permissionName ? -1 : 1))}
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
