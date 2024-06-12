import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { Pluggable, TitleManager } from '@folio/stripes/core';
import { Pane } from '@folio/stripes/components';

const TransferCriteriaSettings = () => {
  const { formatMessage } = useIntl();

  return (
    <TitleManager
      record={formatMessage({ id: 'ui-users.settings.transferCriteria' })}
    >
      <Pluggable type="bursar-export">
        <Pane data-test-transfercriteriasettings>
          <FormattedMessage id="ui-users.settings.transferCriteria.notAvailable" />
        </Pane>
      </Pluggable>
    </TitleManager>
  );
};

export default TransferCriteriaSettings;
