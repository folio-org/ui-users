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

  return (
    <Accordion
      open={expanded}
      id={accordionId}
      onToggle={onToggle}
      displayWhenClosed={
        <Badge>{proxies.length + sponsors.length}</Badge>
      }
      label="Proxy/Sponsor"
    >
      <ProxyViewList records={sponsors} label={`${fullName} is proxy for`} name="sponsors" itemComponent={ProxyItem} />
      <ProxyViewList records={proxies} label={`${fullName} is sponsor of`} name="proxies" itemComponent={ProxyItem} />
    </Accordion>
  );
};

ProxyPermissions.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  proxies: PropTypes.arrayOf(PropTypes.object),
  sponsors: PropTypes.arrayOf(PropTypes.object),
  user: PropTypes.object,
};

export default ProxyPermissions;
