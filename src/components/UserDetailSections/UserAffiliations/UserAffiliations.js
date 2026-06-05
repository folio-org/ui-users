import PropTypes from 'prop-types';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';

import {
  useCallout,
  useStripes,
} from '@folio/stripes/core';
import {
  Accordion,
  Badge,
  ConfirmationModal,
  Headline,
  Icon,
  List,
  Loading,
} from '@folio/stripes/components';

import {
  useUserAffiliations,
  useUserAffiliationsMutation,
  useCheckUserInKeycloak,
} from '../../../hooks';
import AffiliationsManager from '../../AffiliationsManager';
import IfConsortiumPermission from '../../IfConsortiumPermission';
import { KEYCLOAK_USER_EXISTENCE } from '../../../constants';
import { getFullName } from '../../util';

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
  user,
}) => {
  const callout = useCallout();
  const stripes = useStripes();
  const intl = useIntl();
  const [isKeycloakConfirmationOpen, setIsKeycloakConfirmationOpen] = useState(false);
  const [keycloakMissingTenantNames, setKeycloakMissingTenantNames] = useState('');
  const [keycloakMissingTenantCount, setKeycloakMissingTenantCount] = useState(0);
  const pendingAssignmentRef = useRef(null);

  const { checkUserInKeycloakForTenant } = useCheckUserInKeycloak(userId);

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

  const userFullName = getFullName(user);
  const isLoading = isFetching || isAffiliationsMutating;

  const processAssignment = useCallback(async ({ added, removed }) => {
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

  const onUpdateAffiliations = useCallback(async ({ added, removed }) => {
    if (!added.length || !stripes.hasInterface('users-keycloak')) {
      await processAssignment({ added, removed });
      return;
    }

    // Check keycloak existence for each tenant being added.
    const statuses = await Promise.all(
      added.map(async ({ tenantId }) => {
        const status = await checkUserInKeycloakForTenant(tenantId);
        return { tenantId, status };
      })
    );

    const missingTenants = statuses.filter(({ status }) => status === KEYCLOAK_USER_EXISTENCE.nonExist);

    if (missingTenants.length) {
      const userTenants = stripes.user?.user?.tenants || [];
      const names = missingTenants
        .map(({ tenantId }) => userTenants.find(t => t.id === tenantId)?.name || tenantId)
        .join(', ');
      setKeycloakMissingTenantNames(names);
      setKeycloakMissingTenantCount(missingTenants.length);
      pendingAssignmentRef.current = { added, removed };
      setIsKeycloakConfirmationOpen(true);
    } else {
      await processAssignment({ added, removed });
    }
  }, [checkUserInKeycloakForTenant, processAssignment, stripes]);

  const handleConfirmKeycloakCreation = useCallback(async () => {
    setIsKeycloakConfirmationOpen(false);
    await processAssignment(pendingAssignmentRef.current);
    pendingAssignmentRef.current = null;
  }, [processAssignment]);

  const handleCancelKeycloakCreation = useCallback(() => {
    setIsKeycloakConfirmationOpen(false);
    pendingAssignmentRef.current = null;
  }, []);

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
    <>
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
      <ConfirmationModal
        id="affiliations-keycloak-confirmation"
        heading={intl.formatMessage({ id: 'ui-users.keycloak.modal.confirmationHeading' })}
        message={intl.formatMessage({ id: 'ui-users.keycloak.modal.creationMessage' }, {
          user: userFullName,
          tenants: keycloakMissingTenantNames,
          count: keycloakMissingTenantCount,
        })}
        onConfirm={handleConfirmKeycloakCreation}
        onCancel={handleCancelKeycloakCreation}
        open={isKeycloakConfirmationOpen}
        confirmLabel={intl.formatMessage({ id: 'stripes-core.button.confirm' })}
      />
    </>
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
  user: PropTypes.object,
};

export default UserAffiliations;
