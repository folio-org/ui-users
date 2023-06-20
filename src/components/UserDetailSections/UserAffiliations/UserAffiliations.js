import PropTypes from 'prop-types';
import { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import {
  useCallout
} from '@folio/stripes/core';
import {
  Accordion,
  Badge,
  Headline,
  Icon,
  List,
  Loading,
} from '@folio/stripes/components';

import {
  useUserAffiliations,
  useUserAffiliationsMutation,
} from '../../../hooks';
import AffiliationsManager from '../../AffiliationsManager';
import IfConsortiumPermission from '../../IfConsortiumPermission';

import css from './UserAffiliations.css';
import { createErrorMessage } from './util';

const ItemFormatter = ({ tenantName, isPrimary }) => (
  <li className={isPrimary && css.primary}>{tenantName}</li>
);

const UserAffiliations = ({
  accordionId,
  expanded,
  onToggle,
  userId,
  userName,
}) => {
  const callout = useCallout();

  const {
    affiliations,
    totalRecords,
    isFetching,
    refetch,
  } = useUserAffiliations({ userId }, { assignedToCurrentUser: false });

  const {
    handleAssignment,
    isLoading: isAffiliationsMutating,
  } = useUserAffiliationsMutation();

  const isLoading = isFetching || isAffiliationsMutating;

  const onUpdateAffiliations = useCallback(async ({ added, removed }) => {
    try {
      const { success, errors } = await handleAssignment({ added, removed });

      if (success) {
        callout.sendCallout({
          message: <FormattedMessage id="ui-users.affiliations.manager.modal.changes.success" />,
          type: 'success',
        });
      } else {
        callout.sendCallout({
          type: 'error',
          timeout: 0,
          message: (
            <div>
              <div>
                <strong>
                  <FormattedMessage id="ui-users.affiliations.manager.modal.changes.error" />
                </strong>
              </div>
              <ul className={css.errorsList}>
                {errors.map(({ message, code }) => {
                  return (
                    <li key={code}>
                      {createErrorMessage({ message, code, userName })}
                    </li>
                  );
                })}
              </ul>
            </div>
          )
        });
      }

      await refetch();
    } catch (error) {
      callout.sendCallout({
        message: <FormattedMessage id="ui-users.affiliations.manager.modal.generic.error" />,
        type: 'error',
      });
    }
  }, [callout, handleAssignment, refetch, userName]);

  const label = (
    <Headline size="large" tag="h3">
      <FormattedMessage id="ui-users.affiliations.section.label" />
    </Headline>
  );

  const displayWhenOpen = (
    <IfConsortiumPermission perm="consortia.user-tenants.item.post">
      <AffiliationsManager
        disabled={isLoading}
        userId={userId}
        onUpdateAffiliations={onUpdateAffiliations}
      />
    </IfConsortiumPermission>
  );

  const displayWhenClosed = isLoading
    ? <Icon icon="spinner-ellipsis" />
    : <Badge>{totalRecords}</Badge>;

  const affiliationsList = useMemo(() => {
    return (
      <List
        items={affiliations}
        itemFormatter={ItemFormatter}
        listStyle="bullets"
        listClass={css.columns}
        isEmptyMessage={<FormattedMessage id="ui-users.affiliations.section.empty" />}
      />
    );
  }, [affiliations]);

  return (
    <Accordion
      open={expanded}
      id={accordionId}
      onToggle={onToggle}
      label={label}
      displayWhenOpen={displayWhenOpen}
      displayWhenClosed={displayWhenClosed}
    >
      {isLoading ? <Loading /> : affiliationsList}
    </Accordion>
  );
};

ItemFormatter.propTypes = {
  isPrimary: PropTypes.bool,
  tenantName: PropTypes.string.isRequired,
};

UserAffiliations.propTypes = {
  accordionId: PropTypes.string.isRequired,
  expanded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  userId: PropTypes.string,
  userName: PropTypes.string,
};

export default UserAffiliations;
