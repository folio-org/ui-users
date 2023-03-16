import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import {
  Accordion,
  Badge,
  Headline,
  Icon,
  List,
  Loading,
} from '@folio/stripes/components';

import { useUserAffiliations } from '../../../hooks';

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
  const {
    affiliations,
    totalRecords,
    isLoading,
  } = useUserAffiliations({ userId });

  const label = (
    <Headline size="large" tag="h3">
      <FormattedMessage id="ui-users.affiliations.section.label" />
    </Headline>
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
