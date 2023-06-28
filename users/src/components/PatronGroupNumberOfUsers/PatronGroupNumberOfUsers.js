import get from 'lodash/get';
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

class RenderPatronGroupNumberOfUsers extends React.Component {
  static propTypes = {
    item: PropTypes.object.isRequired,
    usersPerGroup: PropTypes.object,
  };

  getFacetCount() {
    const facets = get(this.props.usersPerGroup, 'other.resultInfo.facets[0].facetValues', []);
    let count = 0;
    for (const facet of facets) {
      if (facet.value === this.props.item.id) {
        count = facet.count;
        break;
      }
    }
    return count;
  }

  getNumberOfPatrons() {
    let count = 0;
    if (this.ready()) {
      count = this.getFacetCount();
    }
    const link = `/users/view?filters=pg.${this.props.item.group}`;
    return (count > 0 ? <Link to={`${link}`}><span>{count}</span></Link> : <span>{count}</span>);
  }

  ready() {
    const { usersPerGroup, item } = this.props;
    return usersPerGroup && usersPerGroup.hasLoaded && item.id;
  }

  render() {
    const value = this.getNumberOfPatrons();
    return (<div>{value}</div>);
  }
}

export default RenderPatronGroupNumberOfUsers;
