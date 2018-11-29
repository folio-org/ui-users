import React from 'react';
import { FormattedMessage } from 'react-intl';
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
  const {
    expanded,
    onToggle,
    accordionId,
    initialValues,
  } = props;
  const {
    sponsors,
    proxies,
  } = initialValues;
  const fullName = getFullName(initialValues);

  const proxySponsor = <FormattedMessage id="ui-users.permissions.proxySponsor" />;

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
            <ProxyEditList itemComponent={ProxyEditItem} label={label} name="sponsors" {...props} />
          )}
        </FormattedMessage>
        <br />
        <FormattedMessage id="ui-users.permissions.isSponsorOf" values={{ name: fullName }}>
          { label => (
            <ProxyEditList itemComponent={ProxyEditItem} label={label} name="proxies" {...props} />
          )}
        </FormattedMessage>
        <br />
      </Accordion>
    </IfPermission>
  );
};

EditProxy.propTypes = {
  stripes: PropTypes.object.isRequired,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  initialValues: PropTypes.object,
};

export default EditProxy;
