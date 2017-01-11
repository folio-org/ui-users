import React from 'react';
import css from './ListDropdown.css';
import List from '@folio/stripes-components/lib/List';
import TextField from '@folio/stripes-components/lib/TextField';
import Button from '@folio/stripes-components/lib/Button';
import Icon from '@folio/stripes-components/lib/Icon';

function ListDropdown(props){
  
  const handleItemClick = (item) => props.onClickItem(item.id); 

  const permissionDDFormatter = (item) => (
    <li key={item.name+item.id} >
      <button type="button" className={css.itemControl} onClick={() => {handleItemClick(item)}}>
        {item.name}
      </button>
    </li>
  );
    
  return(
    <div>
      <TextField 
        noBorder 
        placeholder="Search" 
        startControl={<Icon icon="search"/>}
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

