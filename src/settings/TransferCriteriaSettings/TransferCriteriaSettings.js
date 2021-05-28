import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Pluggable } from '@folio/stripes/core';
import { Pane } from '@folio/stripes/components';

const TransferCriteriaSettings = () => {
  return (
    <Pluggable type="bursar-export">
      <Pane data-test-transfercriteriasettings>
        <FormattedMessage id="ui-users.settings.transferCriteria.notAvailable" />
      </Pane>
    </Pluggable>
  );
};

export default TransferCriteriaSettings;
