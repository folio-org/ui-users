import React from 'react';
import PropTypes from 'prop-types';
import { Accordion } from '@folio/stripes-components/lib/Accordion';
import Badge from '@folio/stripes-components/lib/Badge';

import ProxyViewList from '../../ProxyGroup/ProxyViewList';
import ProxyItem from '../../ProxyGroup/ProxyItem';

const ProxyPermissions = ({ onToggle, accordionId, expanded, proxies, sponsors }) => ((
  <Accordion
    open={expanded}
    id={accordionId}
    onToggle={onToggle}
    displayWhenClosed={
      <Badge>{proxies.length + sponsors.length}</Badge>
    }
    label={
      <h2>Proxy</h2>
    }
  >
    <ProxyViewList records={sponsors} label="Sponsors" name="sponsors" itemComponent={ProxyItem} />
    <ProxyViewList records={proxies} label="Proxy" name="proxies" itemComponent={ProxyItem} />
  </Accordion>
));

ProxyPermissions.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  proxies: PropTypes.arrayOf(PropTypes.object),
  sponsors: PropTypes.arrayOf(PropTypes.object),
};

export default ProxyPermissions;
