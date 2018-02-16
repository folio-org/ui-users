import React from 'react';
import PropTypes from 'prop-types';
import { Accordion } from '@folio/stripes-components/lib/Accordion';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Badge from '@folio/stripes-components/lib/Badge';
import IfPermission from '@folio/stripes-components/lib/IfPermission';

import ProxyEditList from '../../ProxyGroup/ProxyEditList';
import ProxyEditItem from '../../ProxyGroup/ProxyEditItem';
import { getFullName } from '../../../util';

const EditProxy = (props) => {
  const { expanded, onToggle, accordionId, initialValues } = props;
  const { sponsors, proxies } = initialValues;
  const fullName = getFullName(initialValues);

  return (
    <IfPermission perm="ui-users.editproxies">
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label="Proxy/Sponsor"
        displayWhenClosed={
          <Badge>{sponsors.length + proxies.length}</Badge>
        }
      >
        <Row>
          <Col xs={8}>
            <ProxyEditList itemComponent={ProxyEditItem} label={`${fullName} is proxy for`} name="sponsors" {...props} />
            <br />
            <ProxyEditList itemComponent={ProxyEditItem} label={`${fullName} is sponsor of`} name="proxies" {...props} />
            <br />
          </Col>
        </Row>
      </Accordion>
    </IfPermission>
  );
};

EditProxy.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  initialValues: PropTypes.object,
};

export default EditProxy;
