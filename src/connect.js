import React, { Component } from 'react';
import { stripesShape, withStripes } from '@folio/stripes/core';

export default function stripesConnect(WrappedComponent) {
  class ConnectedComponent extends Component {
    static propTypes = {
      stripes: stripesShape.isRequired
    }

    constructor(props) {
      super(props);
      this.connectedComponent = props.stripes.connect(WrappedComponent);
    }

    render() {
      return <this.connectedComponent {...this.props} />;
    }
  }

  return withStripes(ConnectedComponent);
}
