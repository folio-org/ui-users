import React from 'react';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import PropTypes from 'prop-types';

import {
  Accordion,
  Badge,
  Headline
} from '@folio/stripes/components';
import { IfPermission } from '@folio/stripes/core';

import ProxyEditList from '../../ProxyGroup/ProxyEditList';
import ProxyEditItem from '../../ProxyGroup/ProxyEditItem';

const EditProxy = (props) => {
  const {
    expanded,
    onToggle,
    accordionId,
    sponsors,
    proxies,
    fullName,
    intl: { formatMessage },
  } = props;

  const proxySponsor = <FormattedMessage id="ui-users.permissions.proxy.sponsor" />;
  const values = { name: fullName };

  return (
    <IfPermission perm="ui-users.editproxies">
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label={<Headline size="large" tag="h3">{proxySponsor}</Headline>}
        displayWhenClosed={
          <Badge>{sponsors.length + proxies.length}</Badge>
        }
      >
        <ProxyEditList
          itemComponent={ProxyEditItem}
          label={formatMessage({ id: 'ui-users.permissions.isProxyFor' }, values)}
          name="sponsors"
        />
        <br />
        <ProxyEditList
          itemComponent={ProxyEditItem}
          label={formatMessage({ id: 'ui-users.permissions.isSponsorOf' }, values)}
          name="proxies"
        />
        <br />
      </Accordion>
    </IfPermission>
  );
};

EditProxy.propTypes = {
  fullName: PropTypes.string,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  proxies: PropTypes.arrayOf(PropTypes.object),
  sponsors: PropTypes.arrayOf(PropTypes.object),
  intl: PropTypes.object.isRequired,
};

export default injectIntl(EditProxy);
