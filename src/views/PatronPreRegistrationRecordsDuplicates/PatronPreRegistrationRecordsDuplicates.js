import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  MessageBanner,
  Pane,
  Paneset,
} from '@folio/stripes/components';

import { useUsersQuery } from '../../hooks';
import { getPatronDuplicatesQuery } from '../../utils';
import PreRegistrationRecordsDuplicatesList from './PreRegistrationRecordsDuplicatesList';

const PatronPreRegistrationRecordsDuplicates = ({
  email,
  onClose,
}) => {
  const {
    isFetched,
    isLoading,
    users,
    totalRecords,
  } = useUsersQuery(
    { query: getPatronDuplicatesQuery({ email }) },
    { enabled: Boolean(email) },
  );

  const paneSub = isFetched
    ? (
      <FormattedMessage
        id="stripes-smart-components.searchResultsCountHeader"
        values={{ count: totalRecords }}
      />
    )
    : <FormattedMessage id="stripes-smart-components.searchCriteria" />;

  return (
    <Paneset isRoot>
      <Pane
        id="pane-user-duplicates"
        defaultWidth="100%"
        dismissible
        onClose={onClose}
        paneTitle={<FormattedMessage id="ui-users.stagingRecords.duplicates.results.paneTitle" />}
        paneSub={paneSub}
      >
        <MessageBanner type="warning">
          <FormattedMessage id="ui-users.stagingRecords.duplicates.results.warning" />
        </MessageBanner>

        <PreRegistrationRecordsDuplicatesList
          isLoading={isLoading}
          email={email}
          users={users}
          totalRecords={totalRecords}
        />
      </Pane>
    </Paneset>
  );
};

PatronPreRegistrationRecordsDuplicates.propTypes = {
  email: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

export default PatronPreRegistrationRecordsDuplicates;
