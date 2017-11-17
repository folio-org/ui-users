import React from 'react';
import PropTypes from 'prop-types';
import { Col } from 'react-flexbox-grid';

export class RenderPatronGroupNumberOfUsers extends React.Component {

  static propTypes = {
    item: PropTypes.object.isRequired,
    gloss: PropTypes.string.isRequired,
    additionalFields: PropTypes.object.isRequired,
  };

  static defaultProps = {};

  static manifest = Object.freeze({});

  constructor(props) {
    super(props);
  }

  getNumberOfPatrons() {
    if (this.ready()) {
      return this.getFacetCount();
    }
  }

  getFacetCount() {
    const inheritedResources = this.props.additionalFields.numberOfUsers.inheritedProps.resources;
    const facets = inheritedResources.usersPerGroup.other.resultInfo.facets;
    for (const facet of facets[0].facetValues) {
      if (facet.value === this.props.item.id) {
        return facet.count;
      }
    }
    return 0;
  }

  ready() {
    const numberOfUsers = this.props.additionalFields.numberOfUsers;
    return numberOfUsers && numberOfUsers.inheritedProps.resources.usersPerGroup.hasLoaded && this.props.item.id;
  }

  render() {
    return (<Col key={this.props.gloss} xs>{this.getNumberOfPatrons()}</Col>);
  }

}
