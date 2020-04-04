import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Conditions from '../Conditions';

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
    id: 'e5b45031-a202-4abb-917b-e1df9346fe2c',
    name: 'Maximum number of overdue recalls',
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
