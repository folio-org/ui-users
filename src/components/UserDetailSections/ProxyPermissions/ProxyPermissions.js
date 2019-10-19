import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Badge,
  Accordion,
  Headline
} from '@folio/stripes/components';

import ProxyViewList from '../../ProxyGroup/ProxyViewList';
import ProxyItem from '../../ProxyGroup/ProxyItem';
import { getFullName } from '../../util';

const ProxyPermissions = (props) => {
  const {
    onToggle,
    accordionId,
    expanded,
    proxies,
    sponsors,
    user,
    stripes,
  } = props;
  const fullName = getFullName(user);

  const isProxyFor = <FormattedMessage id="ui-users.permissions.isProxyFor" values={{ name: fullName }} />;
  const isSponsorOf = <FormattedMessage id="ui-users.permissions.isSponsorOf" values={{ name: fullName }} />;
  const proxySponsor = <FormattedMessage id="ui-users.permissions.proxySponsor" />;

  return (
    <Accordion
      open={expanded}
      id={accordionId}
      onToggle={onToggle}
      displayWhenClosed={
        <Badge>{proxies.length + sponsors.length}</Badge>
      }
      label={<Headline size="large" tag="h3">{proxySponsor}</Headline>}
    >
      <ProxyViewList
        records={sponsors}
        stripes={stripes}
        label={isProxyFor}
        name="sponsors"
        itemComponent={ProxyItem}
      />
      <ProxyViewList
        records={proxies}
        stripes={stripes}
        label={isSponsorOf}
        name="proxies"
        itemComponent={ProxyItem}
      />
    </Accordion>
  );
};

ProxyPermissions.propTypes = {
  stripes: PropTypes.object.isRequired,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  proxies: PropTypes.arrayOf(PropTypes.object),
  sponsors: PropTypes.arrayOf(PropTypes.object),
  user: PropTypes.object,
};

export default ProxyPermissions;
