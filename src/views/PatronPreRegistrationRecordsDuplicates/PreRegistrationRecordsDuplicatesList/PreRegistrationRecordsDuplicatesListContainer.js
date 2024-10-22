import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import {
  useCallout,
  useStripes,
} from '@folio/stripes/core';

import {
  usePatronGroups,
  useStagingUserMutation,
} from '../../../hooks';
import PreRegistrationRecordsDuplicatesList from './PreRegistrationRecordsDuplicatesList';

const PreRegistrationRecordsDuplicatesListContainer = ({
  isLoading,
  totalRecords,
  user,
  users,
}) => {
  const intl = useIntl();
  const history = useHistory();
  const callout = useCallout();
  const stripes = useStripes();

  const {
    isLoading: isPatronGroupsLoading,
    patronGroups,
  } = usePatronGroups({ enabled: Boolean(user?.id) });

  const {
    mergeOrCreateUser,
    isLoading: isMutating,
  } = useStagingUserMutation();

  const onMerge = useCallback((user) => {
    return mergeOrCreateUser({ user })
      .then(({ id }) => {
        stripes.logger.log('hello'); //
        callout.sendCallout({
          message: intl.formatMessage(
            { id: 'ui-users.stagingRecords.duplicates.results.merge.success' },
            { name: 'QWERTY' },
          ),
        });
        history.push(`/users/view/${id}`);
      })
      .catch((error) => {
        stripes.logger.log(error);

        callout.sendCallout({
          message: intl.formatMessage({ id: 'ui-users.errors.generic' }),
          type: 'error',
          timeout: 0,
        });
      });
  }, [callout, history, intl, mergeOrCreateUser, stripes.logger]);

  return (
    <PreRegistrationRecordsDuplicatesList
      isLoading={isLoading || isPatronGroupsLoading || isMutating}
      patronGroups={patronGroups}
      users={users}
      totalRecords={totalRecords}
      onMerge={onMerge}
    />
  );
};

PreRegistrationRecordsDuplicatesListContainer.propTypes = {
  isLoading: PropTypes.bool,
  totalRecords: PropTypes.number,
  user: PropTypes.object,
  users: PropTypes.arrayOf(PropTypes.object),
};

export default PreRegistrationRecordsDuplicatesListContainer;
