import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import {
  Accordion,
  Badge,
  Headline
} from '@folio/stripes/components';
import {
  IfPermission,
  withStripes
} from '@folio/stripes/core';

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
    change,
    stripes,
    initialValues,
    getWarning,
  } = props;

  const proxySponsor = <FormattedMessage id="ui-users.permissions.proxy.sponsor" />;

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
        <FormattedMessage id="ui-users.permissions.isProxyFor" values={{ name: fullName }}>
          { label => (
            <ProxyEditList
              itemComponent={ProxyEditItem}
              label={label}
              name="sponsors"
              stripes={stripes}
              change={change}
              initialValues={initialValues}
              getWarning={getWarning}
            />
          )}
        </FormattedMessage>
        <br />
        <FormattedMessage id="ui-users.permissions.isSponsorOf" values={{ name: fullName }}>
          { label => (
            <ProxyEditList
              itemComponent={ProxyEditItem}
              label={label}
              name="proxies"
              stripes={stripes}
              change={change}
              initialValues={initialValues}
              getWarning={getWarning}
            />
          )}
        </FormattedMessage>
        <br />
      </Accordion>
    </IfPermission>
  );
};

EditProxy.propTypes = {
  change: PropTypes.func,
  fullName: PropTypes.string,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  proxies: PropTypes.arrayOf(PropTypes.object),
  sponsors: PropTypes.arrayOf(PropTypes.object),
  stripes: PropTypes.object,
  initialValues: PropTypes.object,
  getWarning: PropTypes.func.isRequired,
};

export default withStripes(EditProxy);
