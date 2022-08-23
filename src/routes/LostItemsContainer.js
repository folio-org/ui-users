import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { withStripes } from '@folio/stripes/core';

import NoPermissionMessage from '../components/NoPermissionMessage/NoPermissionMessage';

const LostItemsContainer = ({ stripes }) => {
  const hasPermission = stripes.hasPerm('ui-users.lost-items.requiring-actual-cost');

  return (
    !hasPermission && <NoPermissionMessage content={<FormattedMessage id="ui-users.lostItems.message.noAccessToActualCostPage" />} />
  );
};

LostItemsContainer.propTypes = {
  stripes: PropTypes.shape({
    hasPerm: PropTypes.func.isRequired,
  }).isRequired,
};

export default withStripes(LostItemsContainer);
