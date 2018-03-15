import get from 'lodash/get';
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

class RenderPatronGroupNumberOfUsers extends React.Component {
  static propTypes = {
    item: PropTypes.object.isRequired,
    gloss: PropTypes.string.isRequired,
    usersPerGroup: PropTypes.object.isRequired,
  };

  getNumberOfPatrons() {
    let count = 0;
    if (this.ready()) {
      count = this.getFacetCount();
    }
    const link = `/users/view?filters=pg.${this.props.item.group}`;
    return (count > 0 ? <Link to={`${link}`}><span>{count}</span></Link> : <span>{count}</span>);
  }

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

  ready() {
    const { usersPerGroup, item } = this.props;
    return usersPerGroup && usersPerGroup.hasLoaded && item.id;
  }

  render() {
    const value = this.getNumberOfPatrons();
    return (<div key={this.props.gloss} title={value}>{value}</div>);
  }
}

export default RenderPatronGroupNumberOfUsers;
