import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Conditions from '../Conditions';

class RecallOverdueByConditions extends Component {
  static propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    blockBorrowing: PropTypes.bool,
    blockRenewals: PropTypes.bool,
    blockRequests: PropTypes.bool,
    message: PropTypes.string,
  };

  static defaultProps = {
    id: '08530ac4-07f2-48e6-9dda-a97bc2bf7053',
    name: 'Recall overdue by maximum number of days',
    blockBorrowing: true,
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

export default RecallOverdueByConditions;
