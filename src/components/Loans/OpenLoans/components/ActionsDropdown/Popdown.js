import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
} from '@folio/stripes/components';
import Popper from '@folio/stripes-components/lib/Popper/Popper';
import RootCloseWrapper from 'react-overlays/lib/RootCloseWrapper';

class Popdown extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    buttonProps: PropTypes.object,
    label: PropTypes.node,
    renderTrigger: PropTypes.func,
    portal: PropTypes.bool,
  }

  constructor(props) {
    super(props);
    this.state = {
      open: false
    };

    this.triggerRef = React.createRef();
  }

  toggleMenu = (e) => {
    e.stopPropagation();
    this.setState((curState) => {
      return {
        open: !curState.open
      };
    });
  };

  renderTrigger = () => {
    const { renderTrigger: renderTriggerProp, buttonProps, label } = this.props;
    const ariaProps = {
      'aria-expanded': this.state.open,
      'aria-haspopup': true
    };

    if (renderTriggerProp) {
      return renderTriggerProp(this.triggerRef, this.toggleMenu, ariaProps);
    }

    return (
      <Button
        buttonRef={this.triggerRef}
        buttonStyle="none"
        onClick={this.toggleMenu}
        {...buttonProps}
        {...ariaProps}
      >
        {label}
      </Button>
    );
  }

  render() {
    const { children, portal } = this.props;
    const portalEl = document.getElementById('OverlayContainer');
    return (
      <React.Fragment>
        {this.renderTrigger()}
        <Popper
          isOpen={this.state.open}
          anchorRef={this.triggerRef}
          portal={portal ? portalEl : null}
        >
          <RootCloseWrapper onRootClose={this.toggleMenu}>
            {children}
          </RootCloseWrapper>
        </Popper>
      </React.Fragment>
    );
  }
}

export default Popdown;
