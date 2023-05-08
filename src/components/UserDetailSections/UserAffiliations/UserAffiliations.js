import PropTypes from 'prop-types';
import { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import {
  useStripes,
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

import css from './UserAffiliations.css';
import { getResponseErrors } from '../../util';
import { AFFILIATION_ERROR_CODES } from '../../../constants';

const ItemFormatter = ({ tenantName, isPrimary }) => (
  <li className={isPrimary && css.primary}>{tenantName}</li>
);

function extractTenantNameFromErrorMessage(errorMessage) {
  // If message includes tenant and find the tenant name in the error message and the word next to it.
  const extractedMessage = errorMessage.match(/tenant (.*?)(?:\s|$)/g);
  if (!extractedMessage) return '';
  // Remove all non-alphanumeric characters from the tenant name.
  const tenant = extractedMessage[0]?.split(' ')[1].replace(/\W/g, '');
  return tenant;
}

function createErrorMesage({ message, code, userName }) {
  const errorMessageId = AFFILIATION_ERROR_CODES[code] || AFFILIATION_ERROR_CODES.GENERIC_ERROR;
  if (!errorMessageId) return message;

  const tenantName = extractTenantNameFromErrorMessage(message);
  const formattedError = <FormattedMessage
    id={`ui-users.affiliations.manager.modal.changes.error.${errorMessageId}`}
    values={{
      tenantName,
      userName,
    }}
  />;

  return formattedError;
}

const UserAffiliations = ({
  accordionId,
  expanded,
  onToggle,
  userId,
  userName,
}) => {
  const stripes = useStripes();
  const callout = useCallout();

  const {
    affiliations,
    totalRecords,
    isFetching,
    refetch,
  } = useUserAffiliations({ userId });

  const {
    handleAssignment,
    isLoading: isAffiliationsMutating,
  } = useUserAffiliationsMutation();

  const isLoading = isFetching || isAffiliationsMutating;

  const onUpdateAffiliations = useCallback(async ({ added, removed }) => {
    try {
      const responses = await handleAssignment({ added, removed });
      const errors = await getResponseErrors(responses);

      if (errors.length) {
        callout.sendCallout({
          type: 'error',
          message: (
            <div>
              <div>
                <strong>
                  <FormattedMessage id="ui-users.affiliations.manager.modal.changes.error" />
                </strong>
              </div>
              <ul className={css.errorsList}>
                {errors.map(({ message, code }, index) => {
                  return (
                    <li key={code + index}>
                      {createErrorMesage({ message, code, userName })}
                    </li>
                  );
                })}
              </ul>
            </div>
          )
        });
      } else {
        callout.sendCallout({
          message: <FormattedMessage id="ui-users.affiliations.manager.modal.changes.success" />,
          type: 'success',
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

  const displayWhenOpen = stripes.hasPerm('ui-users.consortia.affiliations.edit') && (
    <AffiliationsManager
      disabled={isLoading}
      userId={userId}
      onUpdateAffiliations={onUpdateAffiliations}
    />
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
