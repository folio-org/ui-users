import React from 'react';
import PropTypes from 'prop-types';
import { Accordion } from '@folio/stripes-components/lib/Accordion';
import Badge from '@folio/stripes-components/lib/Badge';

import ProxyViewList from '../../ProxyGroup/ProxyViewList';
import ProxyItem from '../../ProxyGroup/ProxyItem';
import { getFullName } from '../../../util';

const ProxyPermissions = (props) => {
  const { onToggle, accordionId, expanded, proxies, sponsors, user } = props;
  const fullName = getFullName(user);

  const isProxyFor = props.stripes.intl.formatMessage({ id: 'ui-users.permissions.isProxyFor' }, { name: fullName });
  const isSponsorOf = props.stripes.intl.formatMessage({ id: 'ui-users.permissions.isSponsorOf' }, { name: fullName });
  const proxySponsor = props.stripes.intl.formatMessage({ id: 'ui-users.permissions.proxySponsor' });

  return (
    <Accordion
      open={expanded}
      id={accordionId}
      onToggle={onToggle}
      displayWhenClosed={
        <Badge>{proxies.length + sponsors.length}</Badge>
      }
      label={proxySponsor}
    >
      <ProxyViewList records={sponsors} label={isProxyFor} name="sponsors" itemComponent={ProxyItem} />
      <ProxyViewList records={proxies} label={isSponsorOf} name="proxies" itemComponent={ProxyItem} />
    </Accordion>
  );
};

ProxyPermissions.propTypes = {
  stripes: PropTypes.shape({
    intl: PropTypes.object.isRequired,
  }).isRequired,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  proxies: PropTypes.arrayOf(PropTypes.object),
  sponsors: PropTypes.arrayOf(PropTypes.object),
  user: PropTypes.object,
};

export default ProxyPermissions;
