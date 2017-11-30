import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Col } from 'react-flexbox-grid';

class RenderPatronGroupNumberOfUsers extends React.Component {

  static propTypes = {
    item: PropTypes.object.isRequired,
    gloss: PropTypes.string.isRequired,
    additionalFields: PropTypes.object.isRequired,
  };

  static defaultProps = {};

  static manifest = Object.freeze({});

  constructor(props) {
    super(props);
    this.state = {};
  }

  getNumberOfPatrons() {
    let count = 0;
    if (this.ready()) {
      count = this.getFacetCount();
    }
    return count;
  }

  getFacetCount() {
    const facets = _.get(this.props.additionalFields, 'numberOfUsers.inheritedProps.resources.usersPerGroup.other.resultInfo.facets[0].facetValues', []);
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
    const hasLoaded = _.get(this.props.additionalFields, 'numberOfUsers.inheritedProps.resources.usersPerGroup.hasLoaded', false);
    return hasLoaded && this.props.item.id;
  }

  render() {
    return (<Col key={this.props.gloss} xs>{this.getNumberOfPatrons()}</Col>);
  }

}

export default RenderPatronGroupNumberOfUsers;
