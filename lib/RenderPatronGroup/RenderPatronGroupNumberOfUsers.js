import React from 'react';
import PropTypes from 'prop-types';
import { Col } from 'react-flexbox-grid';

export default class RenderPatronGroupNumberOfUsers extends React.Component {

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
    const inheritedResources = this.props.additionalFields.numberOfUsers.inheritedProps.resources;
    const facets = inheritedResources.usersPerGroup.other.resultInfo.facets;
    let count = 0;
    for (const facet of facets[0].facetValues) {
      if (facet.value === this.props.item.id) {
        count = facet.count;
        break;
      }
    }
    return count;
  }

  ready() {
    const numberOfUsers = this.props.additionalFields.numberOfUsers;
    return numberOfUsers && numberOfUsers.inheritedProps.resources.usersPerGroup.hasLoaded && this.props.item.id;
  }

  render() {
    return (<Col key={this.props.gloss} xs>{this.getNumberOfPatrons()}</Col>);
  }

}
