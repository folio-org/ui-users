import React, { PropTypes } from 'react';
import css from './FilterPaneSearch.css';
import Icon from '@folio/stripes-components/lib/Icon';
import Button from '@folio/stripes-components/lib/Button';

class FilterPaneSearch extends React.Component{
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor(props){
    super(props);
    this.searchInput = null;
  }

  clearSearchField(){
    this.searchInput.value = '';
    const evt =  new Event('input', {bubbles: true});
    this.searchInput.dispatchEvent(evt);
  }

  onChange() {
    const value = this.searchInput.value;
    this.context.router.transitionTo("/users/" + value);
  }
  
  render(){
    return(
      <div className={css.headerSearchContainer}>
        <div style={{alignSelf:"center"}}><Icon icon="search"/></div>
        <input className={css.headerSearchInput} ref={(ref) => this.searchInput = ref} type="text" value = {this.props.value} onChange={this.onChange.bind(this)} placeholder="Search"/>
        <Button className={css.headerSearchClearButton} onClick={this.clearSearchField.bind(this)} ><Icon icon="clearX" iconClassName={css.clearIcon}/></Button>
      </div>
    );
  }
}

export default FilterPaneSearch;

