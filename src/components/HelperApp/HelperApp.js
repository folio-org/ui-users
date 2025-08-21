import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Tags } from '@folio/stripes/smart-components';
import { stripesConnect } from '@folio/stripes/core';

class HelperApp extends React.Component {
  static propTypes = {
    match: PropTypes.shape({}),
    stripes: PropTypes.shape({}),
    onClose: PropTypes.func,
    appName: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.helperApps = {
      tags: stripesConnect(Tags)
    };
  }

  renderHelperApp = () => {
    const {
      match: { params },
      appName,
      onClose,
    } = this.props;

    const HelperAppComponent = this.helperApps[appName];

    return (
      <HelperAppComponent
        link={`users/${params.id}`}
        onToggle={onClose}
        {...this.props}
      />
    );
  }

  render() {
    return this.renderHelperApp();
  }
}

export default withRouter(stripesConnect(HelperApp));
