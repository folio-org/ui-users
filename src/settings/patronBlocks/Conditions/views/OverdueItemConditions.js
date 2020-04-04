import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Conditions from '../Conditions';

class OverdueRecallConditions extends Component {
  static propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    blockBorrowing: PropTypes.bool,
    blockRenewals: PropTypes.bool,
    blockRequests: PropTypes.bool,
    message: PropTypes.string,
  };

  static defaultProps = {
    id: '584fbd4f-6a34-4730-a6ca-73a6a6a9d845',
    name: 'The maximum number of overdue items has been reached',
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

export default OverdueRecallConditions;
