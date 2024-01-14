import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { IfPermission } from '@folio/stripes/core';
import {
  Button,
  Icon,
} from '@folio/stripes/components';

const PatronNoticePrintJobsLink = () => {
  const history = useHistory();

  return (
    <IfPermission perm="mod-batch-print.entries.collection.get">
      <Button
        data-testid="patronNoticePrintJobsLink"
        to={{
          pathname: '/users/patron-notice-print-jobs',
          state: {
            pathname: history?.location?.pathname,
            search: history?.location?.search,
          },
        }}
        buttonStyle="dropdownItem"
      >
        <Icon icon="download">
          <FormattedMessage id="ui-users.actionMenu.patronNoticePrintJobs" />
        </Icon>
      </Button>
    </IfPermission>
  );
};


export default PatronNoticePrintJobsLink;
