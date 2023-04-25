import PropTypes from 'prop-types';
import { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import { useStripes } from '@folio/stripes/core';
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

const ItemFormatter = ({ tenantName, isPrimary }) => (
  <li className={isPrimary && css.primary}>{tenantName}</li>
);

const UserAffiliations = ({
  accordionId,
  expanded,
  onToggle,
  userId,
}) => {
  const stripes = useStripes();

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

  const onUpdateAffiliations = useCallback(({ added, removed }) => {
    return handleAssignment({ added, removed })
      .then(refetch);
  }, [handleAssignment, refetch]);

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
};

export default UserAffiliations;
