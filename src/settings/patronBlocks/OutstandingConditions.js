import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Conditions from './Conditions/Conditions';

class LostItemConditions extends Component {
  static propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    blockBorrowing: PropTypes.bool,
    blockRenewals: PropTypes.bool,
    blockRequests: PropTypes.bool,
    message: PropTypes.string,
  };

  static defaultProps = {
    id: 'cf7a0d5f-a327-4ca1-aa9e-dc55ec006b8a',
    name: 'Maximum outstanding fee/fine balance',
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

export default LostItemConditions;
