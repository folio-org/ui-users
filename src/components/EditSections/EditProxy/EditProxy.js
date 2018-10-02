import React from 'react';
import PropTypes from 'prop-types';
import {
  Accordion,
  Badge,
  IfPermission,
  Headline
} from '@folio/stripes/components';

import ProxyEditList from '../../ProxyGroup/ProxyEditList';
import ProxyEditItem from '../../ProxyGroup/ProxyEditItem';
import { getFullName } from '../../../util';

const EditProxy = (props) => {
  const { expanded, onToggle, accordionId, initialValues } = props;
  const { sponsors, proxies } = initialValues;
  const fullName = getFullName(initialValues);

  const isProxyFor = props.stripes.intl.formatMessage({ id: 'ui-users.permissions.isProxyFor' }, { name: fullName });
  const isSponsorOf = props.stripes.intl.formatMessage({ id: 'ui-users.permissions.isSponsorOf' }, { name: fullName });
  const proxySponsor = props.stripes.intl.formatMessage({ id: 'ui-users.permissions.proxySponsor' });

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
        <ProxyEditList itemComponent={ProxyEditItem} label={isProxyFor} name="sponsors" {...props} />
        <br />
        <ProxyEditList itemComponent={ProxyEditItem} label={isSponsorOf} name="proxies" {...props} />
        <br />
      </Accordion>
    </IfPermission>
  );
};

EditProxy.propTypes = {
  stripes: PropTypes.shape({
    intl: PropTypes.object.isRequired,
  }).isRequired,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  initialValues: PropTypes.object,
};

export default EditProxy;
