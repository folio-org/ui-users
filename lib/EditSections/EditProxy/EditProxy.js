import React from 'react';
import PropTypes from 'prop-types';
import { Accordion } from '@folio/stripes-components/lib/Accordion';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Badge from '@folio/stripes-components/lib/Badge';

import ProxyEditList from '../../ProxyGroup/ProxyEditList';
import ProxyEditItem from '../../ProxyGroup/ProxyEditItem';

const EditProxy = (props) => {
  const { expanded, onToggle, accordionId, initialValues } = props;

  return (
    <Accordion
      open={expanded}
      id={accordionId}
      onToggle={onToggle}
      label={
        <h2>Proxy</h2>
      }
      displayWhenClosed={
        <Badge>{initialValues.sponsors.length + initialValues.proxies.length}</Badge>
      }
    >
      <Row>
        <Col xs={8}>
          <ProxyEditList itemComponent={ProxyEditItem} label="Sponsors" name="sponsors" {...props} />
          <br />
          <ProxyEditList itemComponent={ProxyEditItem} label="Proxy" name="proxies" {...props} />
          <br />
        </Col>
      </Row>
    </Accordion>
  );
};

EditProxy.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
};

export default EditProxy;
