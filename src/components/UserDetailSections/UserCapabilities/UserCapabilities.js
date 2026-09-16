import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import {
  Accordion,
  Badge,
  Headline,
  Loading,
} from '@folio/stripes/components';
import { CapabilitiesSection } from '@folio/stripes-authorization-components';

import { useNonRoleUserCapabilities } from '../../../hooks';

const isCapabilitySelected = () => true;

const UserCapabilities = ({ stripes, accordionId, expanded, onToggle }) => {
  const { id: userId } = useParams();

  const {
    groupedNonRoleUserCapabilitiesByType,
    capabilitiesTotalCount,
    isLoading,
  } = useNonRoleUserCapabilities(userId, stripes.okapi.tenant);

  return (
    <Accordion
      open={expanded}
      id={accordionId}
      onToggle={onToggle}
      label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.capabilities.userCapabilities" /></Headline>}
      displayWhenClosed={isLoading ? <Loading /> : <Badge>{capabilitiesTotalCount}</Badge>}
    >
      {isLoading
        ? <Loading />
        : (
          capabilitiesTotalCount
            ? (
              <CapabilitiesSection
                readOnly
                capabilities={groupedNonRoleUserCapabilitiesByType}
                isCapabilitySelected={isCapabilitySelected}
              />
            )
            : <FormattedMessage id="ui-users.capabilities.empty" />
        )}
    </Accordion>
  );
};

UserCapabilities.propTypes = {
  stripes: PropTypes.shape({
    okapi: PropTypes.shape({ tenant: PropTypes.string }).isRequired,
  }).isRequired,
  accordionId: PropTypes.string,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
};

export default UserCapabilities;
