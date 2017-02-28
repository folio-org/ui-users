import React from 'react';
import css from './ListDropdown.css';
import List from '@folio/stripes-components/lib/List';
import TextField from '@folio/stripes-components/lib/TextField';
import Button from '@folio/stripes-components/lib/Button';
import Icon from '@folio/stripes-components/lib/Icon';

function ListDropdown(props){
  
  const handleItemClick = (item) => props.onClickItem(item);
  const handleSearchChange = (e) => props.onChangeSearch(e);  

  const permissionDDFormatter = (item) => (
    <li key={item.permissionName} >
      <button type="button" className={css.itemControl} onClick={() => {handleItemClick(item)}}>
        {item.permissionName}
      </button>
    </li>
  );
    
  return(
    <div>
      <TextField 
        noBorder 
        placeholder="Search" 
        startControl={<Icon icon="search"/>}
        onChange={handleSearchChange}
      />
      <List 
        itemFormatter={permissionDDFormatter}
        items={props.items}
        listClass={css.ListDropdown}
      />
    </div>
  );
}

export default ListDropdown;

