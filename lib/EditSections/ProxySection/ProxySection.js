import React from 'react';
import PropTypes from 'prop-types';
import { Accordion } from '@folio/stripes-components/lib/Accordion';

import ProxyEditList from '../../ProxyGroup/ProxyEditList';
import ProxyEditItem from '../../ProxyGroup/ProxyEditItem';

const ProxySection = (props) => {
  const { expanded, onToggle, accordionId } = props;

  return (
    <Accordion
      open={expanded}
      id={accordionId}
      onToggle={onToggle}
      label={
        <h2>Proxy</h2>
      }
    >
      <div>
        <ProxyEditList itemComponent={ProxyEditItem} label="Sponsors" name="sponsors" {...props} />
        <br />
        <ProxyEditList itemComponent={ProxyEditItem} label="Proxy" name="proxies" {...props} />
      </div>
    </Accordion>
  );
};

ProxySection.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
};

export default ProxySection;
