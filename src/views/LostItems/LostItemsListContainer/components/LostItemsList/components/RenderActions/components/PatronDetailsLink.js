import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';

import { Button } from '@folio/stripes/components';

import {
  ACTUAL_COST_RECORD_FIELD_NAME,
  ACTUAL_COST_RECORD_FIELD_PATH,
  DEFAULT_VALUE,
} from '../../../../../../constants';

const PatronDetailsLink = ({ actualCostRecord }) => {
  const userId = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.USER_ID], DEFAULT_VALUE);
  const isPatronDetailsLinkActive = userId;
  const patronDetailsLink = `/users/preview/${userId}`;

  return (
    <Button
      data-testid="patronDetailsLink"
      buttonStyle="dropdownItem"
      to={patronDetailsLink}
      disabled={!isPatronDetailsLinkActive}
    >
      <FormattedMessage id="ui-users.lostItems.list.columnName.action.patronDetails" />
    </Button>
  );
};

PatronDetailsLink.propTypes = {
  actualCostRecord: PropTypes.shape({
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default PatronDetailsLink;
