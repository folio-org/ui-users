import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Conditions from '../Conditions';

class ChargedOutConditions extends Component {
  static propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    blockBorrowing: PropTypes.bool,
    blockRenewals: PropTypes.bool,
    blockRequests: PropTypes.bool,
    message: PropTypes.string,
  };

  static defaultProps = {
    id: '3d7c52dc-c732-4223-8bf8-e5917801386f',
    name: 'Maximum number of items charged out',
    blockBorrowing: false,
    blockRenewals: false,
    blockRequests: false,
    message: '',
  }

  render() {
    const {
      id,
      name,
      blockBorrowing,
      blockRenewals,
      blockRequests,
      message,
    } = this.props;

    return (
      <Conditions
        id={id}
        name={name}
        blockBorrowing={blockBorrowing}
        blockRenewals={blockRenewals}
        blockRequests={blockRequests}
        message={message}
      />
    );
  }
}

export default ChargedOutConditions;
