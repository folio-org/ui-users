import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
} from '@folio/stripes/components';
/* eslint-disable */
import Popper from '@folio/stripes-components/lib/Popper/Popper';
import RootCloseWrapper from 'react-overlays/lib/RootCloseWrapper';
/* eslint-enable */

const Popdown = ({ label, buttonProps, children, renderTrigger, portal }) => {
  const [open, setOpen] = useState(false);

  const triggerRef = React.createRef();

  const toggleMenu = (e) => {
    e.stopPropagation();
    setOpen(prevOpen => !prevOpen);
  };

  const ariaProps = {
    'aria-expanded': open,
    'aria-haspopup': true
  };

  const trigger = renderTrigger ?
    renderTrigger(triggerRef, toggleMenu, ariaProps) :
    (
      <Button
        buttonRef={triggerRef}
        buttonStyle="none"
        onClick={toggleMenu}
        {...buttonProps}
        {...ariaProps}
      >
        {label}
      </Button>
    );

  const portalEl = document.getElementById('OverlayContainer');

  return (
    <React.Fragment>
      {trigger}
      <Popper
        modifiers={{
          flip: { boundariesElement: 'scrollParent', padding: 10 },
          preventOverflow: { boundariesElement: 'scrollParent', padding: 10 }
        }}
        placement="bottom-start"
        isOpen={open}
        anchorRef={triggerRef}
        portal={portal ? portalEl : null}
      >
        <RootCloseWrapper onRootClose={toggleMenu}>
          {children}
        </RootCloseWrapper>
      </Popper>
    </React.Fragment>
  );
};

Popdown.propTypes = {
  children: PropTypes.node,
  buttonProps: PropTypes.object,
  label: PropTypes.node,
  renderTrigger: PropTypes.func,
  portal: PropTypes.bool,
};

export default Popdown;
